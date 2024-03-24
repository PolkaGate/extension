// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
import { Box, Collapse, Divider, Grid, Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect,useMemo, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { stars6Black, stars6White } from '../../../assets/icons';
import { AccountsAssetsContext, DisplayLogo } from '../../../components';
import { nFormatter } from '../../../components/FormatPrice';
import { useCurrency, usePrices3, useTranslation, useYouHave } from '../../../hooks';
import { FetchedBalance } from '../../../hooks/useAssetsBalances';
import { TEST_NETS, TOKENS_WITH_BLACK_LOGO } from '../../../util/constants';
import getLogo2 from '../../../util/getLogo2';
import { amountToHuman } from '../../../util/utils';
import Chart from './Chart';

interface Props {
  hideNumbers: boolean | undefined;
  setGroupedAssets: React.Dispatch<React.SetStateAction<AssetsWithUiAndPrice[] | undefined>>
}

interface AssetsWithUiAndPrice extends FetchedBalance {
  percent: number;
  price: number;
  ui: {
    color: string | undefined;
    logo: string | undefined;
  };
}

export function adjustColor(token: string, color: string, theme: Theme): string {
  if ((TOKENS_WITH_BLACK_LOGO.find((t) => t === token) && theme.palette.mode === 'dark')) {
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

  return color;
}

function TotalBalancePieChart({ hideNumbers, setGroupedAssets }: Props): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const currency = useCurrency();
  const pricesInCurrencies = usePrices3();
  const youHave = useYouHave();

  const { accountsAssets } = useContext(AccountsAssetsContext);

  const [showMore, setShowMore] = useState<boolean>(false);

  const calPrice = useCallback((assetPrice: number | undefined, balance: BN, decimal: number) => parseFloat(amountToHuman(balance, decimal)) * (assetPrice ?? 0), []);
  const formatNumber = useCallback((num: number) => {
    return parseFloat(Math.trunc(num) === 0 ? num.toFixed(2) : num.toFixed(1));
  }, []);

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);

  const assets = useMemo((): AssetsWithUiAndPrice[] | undefined => {
    if (!accountsAssets || !youHave || !pricesInCurrencies) {
      return undefined;
    }

    let allAccountsAssets = [] as AssetsWithUiAndPrice[];
    const balances = accountsAssets.balances;

    Object.keys(balances).forEach((address) => {
      Object.keys(balances?.[address]).forEach((genesisHash) => {
        if (!TEST_NETS.includes(genesisHash)) {
          allAccountsAssets = allAccountsAssets.concat(balances[address][genesisHash]);
        }
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const groupedAssets = Object.groupBy(allAccountsAssets, ({ genesisHash, token }) => `${token}_${genesisHash}`);
    const aggregatedAssets = Object.keys(groupedAssets).map((index) => {
      const assetSample = groupedAssets[index][0] as AssetsWithUiAndPrice;
      const ui = getLogo2(assetSample?.genesisHash, assetSample?.token);
      const assetPrice = pricesInCurrencies.prices[assetSample.priceId]?.value;
      const accumulatedPricePerAsset = groupedAssets[index].reduce((sum, { totalBalance }) => sum.add(new BN(totalBalance)), BN_ZERO) as BN;

      const balancePrice = calPrice(assetPrice, accumulatedPricePerAsset, assetSample.decimal ?? 0);

      return (
        {
          ...assetSample,
          percent: formatNumber((balancePrice / youHave) * 100),
          price: assetPrice,
          totalBalance: balancePrice,
          ui: {
            color: adjustColor(assetSample.token, ui?.color, theme),
            logo: ui?.logo
          }
        }
      );
    });

    aggregatedAssets.sort((a, b) => {
      if (a.percent < b.percent) {
        return 1;
      } else if (a.percent > b.percent) {
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

  const DisplayAssetRow = ({ asset }: { asset: FetchedBalance }) => {
    const logoInfo = useMemo(() => asset && getLogo2(asset.genesisHash, asset.token), [asset]);

    return (
      <Grid container item justifyContent='space-between'>
        <Grid alignItems='center' container item width='fit-content'>
          <DisplayLogo assetSize='20px' baseTokenSize='14px' genesisHash={asset.genesisHash} logo={logoInfo?.logo} subLogo={logoInfo?.subLogo} />
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
    <Grid alignItems='center' container direction='column' item justifyContent='center' sx={{ bgcolor: 'background.paper', border: isDarkTheme ? '0.1px solid' : 'none', borderColor: 'secondary.main', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', height: 'fit-content', p: '15px 30px', width: '430px' }}>
      <Grid alignItems='center' container gap='15px' item justifyContent='center'>
        <Typography fontSize='28px' fontWeight={400}>
          {t('You have')}
        </Typography>
        {hideNumbers || hideNumbers === undefined
          ? <Box
            component='img'
            src={(theme.palette.mode === 'dark' ? stars6White : stars6Black) as string}
            sx={{ height: '60px', width: '154px' }}
          />
          : <Typography fontSize='40px' fontWeight={700}>
            {`${currency?.sign ?? ''}${nFormatter(youHave ?? 0, 2)}`}
          </Typography>}
      </Grid>
      {youHave !== 0 && assets && assets.length > 0 &&
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
