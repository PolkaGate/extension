// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { FetchedBalance } from '../../../hooks/useAssetsBalances';

import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
import { Box, Collapse, Divider, Grid, type Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { stars6Black, stars6White } from '../../../assets/icons';
import { AccountsAssetsContext, AssetLogo } from '../../../components';
import { nFormatter } from '../../../components/FormatPrice';
import { useCurrency, usePrices, useTranslation, useYouHave } from '../../../hooks';
import { isPriceOutdated } from '../../../popup/home/YouHave';
import { DEFAULT_COLOR, TEST_NETS, TOKENS_WITH_BLACK_LOGO } from '../../../util/constants';
import getLogo2 from '../../../util/getLogo2';
import { amountToHuman } from '../../../util/utils';
import Chart from './Chart';

interface Props {
  hideNumbers: boolean | undefined;
  setGroupedAssets: React.Dispatch<React.SetStateAction<AssetsWithUiAndPrice[] | undefined>>
}

export interface AssetsWithUiAndPrice {
  percent: number;
  price: number;
  totalBalance: number;
  ui: {
    color: string | undefined;
    logo: string | undefined;
  };
  assetId?: number,
  chainName: string,
  date?: number,
  decimal: number,
  genesisHash: string,
  priceId: string,
  token: string,
  availableBalance: BN,
  soloTotal?: BN,
  pooledBalance?: BN,
  lockedBalance?: BN,
  vestingLocked?: BN,
  vestedClaimable?: BN,
  vestingTotal?: BN,
  freeBalance?: BN,
  frozenFee?: BN,
  frozenMisc: BN,
  reservedBalance?: BN,
  votingBalance?: BN
}

export function adjustColor(token: string, color: string | undefined, theme: Theme): string {
  if (color && (TOKENS_WITH_BLACK_LOGO.find((t) => t === token) && theme.palette.mode === 'dark')) {
    const cleanedColor = color.replace(/^#/, '');

    // Convert hexadecimal to RGB
    const r = parseInt(cleanedColor.substring(0, 2), 16);
    const g = parseInt(cleanedColor.substring(2, 4), 16);
    const b = parseInt(cleanedColor.substring(4, 6), 16);

    // Calculate inverted RGB values
    const invertedR = 255 - r;
    const invertedG = 255 - g;
    const invertedB = 255 - b;

    // Convert back to hexadecimal format
    const invertedHex = `#${(1 << 24 | invertedR << 16 | invertedG << 8 | invertedB).toString(16).slice(1)}`;

    return invertedHex;
  }

  return color || DEFAULT_COLOR;
}

function TotalBalancePieChart({ hideNumbers, setGroupedAssets }: Props): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const currency = useCurrency();
  const pricesInCurrencies = usePrices();
  const youHave = useYouHave();

  const { accountsAssets } = useContext(AccountsAssetsContext);

  const [showMore, setShowMore] = useState<boolean>(false);

  const calPrice = useCallback((assetPrice: number | undefined, balance: BN, decimal: number) => parseFloat(amountToHuman(balance, decimal)) * (assetPrice ?? 0), []);
  const formatNumber = useCallback(
    (num: number, decimal = 2) =>
      parseFloat(Math.trunc(num) === 0 ? num.toFixed(decimal) : num.toFixed(1))
    , []);

  const assets = useMemo((): AssetsWithUiAndPrice[] | undefined => {
    if (!accountsAssets || !youHave || !pricesInCurrencies) {
      return undefined;
    }

    let allAccountsAssets = [] as AssetsWithUiAndPrice[];
    const balances = accountsAssets.balances;

    Object.keys(balances).forEach((address) => {
      Object.keys(balances?.[address]).forEach((genesisHash) => {
        if (!TEST_NETS.includes(genesisHash)) {
          //@ts-ignore
          allAccountsAssets = allAccountsAssets.concat(balances[address][genesisHash]);
        }
      });
    });

    //@ts-ignore
    const groupedAssets = Object.groupBy(allAccountsAssets, ({ genesisHash, token }: { genesisHash: string, token: string }) => `${token}_${genesisHash}`);
    const aggregatedAssets = Object.keys(groupedAssets).map((index) => {
      const assetSample = groupedAssets[index][0] as AssetsWithUiAndPrice;
      const ui = getLogo2(assetSample?.genesisHash, assetSample?.token);
      const assetPrice = pricesInCurrencies.prices[assetSample.priceId]?.value;
      const accumulatedPricePerAsset = groupedAssets[index].reduce((sum: BN, { totalBalance }: FetchedBalance) => sum.add(new BN(totalBalance)), BN_ZERO) as BN;

      const balancePrice = calPrice(assetPrice, accumulatedPricePerAsset, assetSample.decimal ?? 0);

      const _percent = (balancePrice / youHave.portfolio) * 100;

      return (
        {
          ...assetSample,
          percent: formatNumber(_percent),
          price: assetPrice,
          sortItem: formatNumber(_percent, 6),
          totalBalance: balancePrice,
          ui: {
            color: adjustColor(assetSample.token, ui?.color, theme),
            logo: ui?.logo
          }
        }
      );
    });

    aggregatedAssets.sort((a, b) => {
      if (a.sortItem < b.sortItem) {
        return 1;
      } else if (a.sortItem > b.sortItem) {
        return -1;
      }

      return 0;
    });

    return aggregatedAssets;
  }, [accountsAssets, youHave, calPrice, formatNumber, pricesInCurrencies, theme]);

  useEffect(() => {
    assets && setGroupedAssets([...assets]);
  }, [assets, setGroupedAssets]);

  const toggleAssets = useCallback(() => setShowMore(!showMore), [showMore]);

  const DisplayAssetRow = ({ asset }: { asset: AssetsWithUiAndPrice }) => {
    const logoInfo = useMemo(() => asset && getLogo2(asset.genesisHash, asset.token), [asset]);

    return (
      <Grid container item justifyContent='space-between'>
        <Grid alignItems='center' container item width='fit-content'>
          <AssetLogo assetSize='20px' baseTokenSize='14px' genesisHash={asset.genesisHash} logo={logoInfo?.logo} subLogo={logoInfo?.subLogo} />
          <Typography fontSize='16px' fontWeight={500} pl='5px' width='40px'>
            {asset.token}
          </Typography>
        </Grid>
        <Grid alignItems='center' columnGap='10px' container item width='fit-content'>
          <Typography fontSize='16px' fontWeight={600}>
            {hideNumbers || hideNumbers === undefined ? '****' : `${currency?.sign ?? ''}${nFormatter(asset.totalBalance ?? 0, 2)}`}
          </Typography>
          <Divider orientation='vertical' sx={{ bgcolor: asset.ui.color, height: '21px', m: 'auto', width: '5px' }} />
          <Typography fontSize='16px' fontWeight={400} m='auto' width='40px'>
            {hideNumbers || hideNumbers === undefined ? '****' : `${asset.percent}%`}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  return (
    <Grid alignItems='center' container direction='column' item justifyContent='center' sx={{ bgcolor: 'background.paper', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', height: 'fit-content', p: '15px 30px 10px', width: '430px' }}>
      <Grid alignItems='center' container gap='15px' item justifyContent='center'>
        <Typography sx={{ fontSize: '28px', fontVariant: 'small-caps', fontWeight: 400 }}>
          {t('My Portfolio')}
        </Typography>
        {hideNumbers || hideNumbers === undefined
          ? <Box
            component='img'
            src={(theme.palette.mode === 'dark' ? stars6White : stars6Black) as string}
            sx={{ height: '60px', width: '154px' }}
          />
          : <Typography fontSize='40px' fontWeight={700} sx={{ color: isPriceOutdated(youHave) ? 'primary.light' : 'text.primary' }}>
            {`${currency?.sign ?? ''}${nFormatter(youHave?.portfolio ?? 0, 2)}`}
          </Typography>}
      </Grid>
      {youHave?.portfolio !== 0 && assets && assets.length > 0 &&
        <Grid container item sx={{ borderTop: '1px solid', borderTopColor: 'divider', pt: '10px' }}>
          <Chart assets={assets} />
          <Grid container item pt='10px' rowGap='10px' xs>
            {assets.slice(0, 3).map((asset, index) => (
              <DisplayAssetRow
                asset={asset}
                key={index}
              />
            ))}
            {assets.length > 3 &&
              <Grid container item justifyContent='flex-end'>
                <Collapse in={showMore} orientation='vertical' sx={{ '> .MuiCollapse-wrapper .MuiCollapse-wrapperInner': { display: 'grid', rowGap: '10px' }, width: '100%' }}>
                  {assets.slice(3).map((asset, index) => (
                    <DisplayAssetRow
                      asset={asset}
                      key={index}
                    />
                  ))}
                </Collapse>
                <Divider sx={{ bgcolor: 'divider', height: '2px', mt: '10px', width: '100%' }} />
                <Grid alignItems='center' container item onClick={toggleAssets} sx={{ cursor: 'pointer', p: '5px', width: 'fit-content' }}>
                  <Typography color='secondary.light' fontSize='16px' fontWeight={400}>
                    {t<string>(showMore ? t('Less tokens') : t('More tokens'))}
                  </Typography>
                  <ArrowDropDownIcon sx={{ color: 'secondary.light', fontSize: '20px', stroke: '#BA2882', strokeWidth: '2px', transform: showMore ? 'rotate(-180deg)' : 'rotate(0deg)', transitionDuration: '0.2s', transitionProperty: 'transform' }} />
                </Grid>
              </Grid>
            }
          </Grid>
        </Grid>}
    </Grid>
  );
}

export default React.memo(TotalBalancePieChart);
