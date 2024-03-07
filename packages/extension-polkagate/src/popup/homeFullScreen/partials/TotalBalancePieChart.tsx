// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
import { Avatar, Box, Collapse, Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { FetchedBalance } from '../../..//hooks/useAssetsOnChains2';
import { stars6Black, stars6White } from '../../../assets/icons';
import { AccountsAssetsContext } from '../../../components';
import { nFormatter } from '../../../components/FormatPrice';
import { useCurrency, usePrices3, useTranslation } from '../../../hooks';
import { CHAINS_WITH_BLACK_LOGO, TEST_NETS } from '../../../util/constants';
import getLogo2 from '../../../util/getLogo2';
import { amountToHuman } from '../../../util/utils';
import Chart from './Chart';

interface Props {
  hideNumbers: boolean | undefined;
}

type UiType = { logo: string | undefined, color: string | undefined };

type AssetType = {
  balance: number;
  genesishash: string;
  percent: number;
  token: string;
  ui: UiType;
}

function TotalBalancePieChart({ hideNumbers }: Props): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const currency = useCurrency();
  const pricesInCurrencies = usePrices3();

  const { accountsAssets } = useContext(AccountsAssetsContext);

  const [showMore, setShowMore] = useState<boolean>(false);

  const calPrice = useCallback((assetPrice: number | undefined, balance: BN, decimal: number) => parseFloat(amountToHuman(balance, decimal)) * (assetPrice ?? 0), []);
  const formatNumber = useCallback((num: number) => {
    return parseFloat(Math.trunc(num) === 0 ? num.toFixed(2) : num.toFixed(1));
  }, []);

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const borderColor = useMemo(() => isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', [isDarkTheme]);

  const allAccountsTotalBalance = useMemo(() => {
    if (!accountsAssets?.balances || !pricesInCurrencies) {
      return undefined;
    }

    let totalPrice = 0;
    const balances = accountsAssets.balances;

    Object.keys(balances).forEach((address) => {
      Object.keys(balances?.[address]).forEach((genesisHash) => {
        balances?.[address]?.[genesisHash].forEach((asset) => {
          totalPrice += calPrice(pricesInCurrencies.prices[asset.priceId]?.value ?? 0, asset.totalBalance, asset.decimal);
        });
      });
    });

    return totalPrice;
  }, [accountsAssets, calPrice, pricesInCurrencies]);

  const assets = useMemo(() => {
    if (!accountsAssets || !allAccountsTotalBalance || !pricesInCurrencies) {
      return undefined;
    }

    let allAccountsAssets = [] as FetchedBalance[];
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
      const assetSample = groupedAssets[index][0] as FetchedBalance;
      const ui = getLogo2(assetSample?.genesisHash, assetSample?.token);
      const assetPrice = pricesInCurrencies.prices[assetSample.priceId]?.value;
      const accumulatedPricePerAsset = groupedAssets[index].reduce((sum, { totalBalance }) => sum.add(new BN(totalBalance)), BN_ZERO) as BN;

      const balancePrice = calPrice(assetPrice, accumulatedPricePerAsset, assetSample.decimal ?? 0);

      return (
        {
          ...assetSample,
          percent: formatNumber((balancePrice / allAccountsTotalBalance) * 100),
          price: assetPrice,
          totalBalance: balancePrice,
          ui: {
            color: ui?.color,
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
  }, [accountsAssets, allAccountsTotalBalance, calPrice, formatNumber, pricesInCurrencies]);

  const toggleAssets = useCallback(() => setShowMore(!showMore), [showMore]);

  const DisplayAssetRow = ({ asset }: { asset: FetchedBalance }) => (
    <Grid container item justifyContent='space-between'>
      <Grid alignItems='center' container item width='fit-content'>
        <Avatar
          src={asset.ui.logo}
          sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(asset.token) && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: 20, width: 20 }}
          variant='square'
        />
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

  return (
    <Grid alignItems='center' container direction='column' item justifyContent='center' sx={{ bgcolor: 'background.paper', border: isDarkTheme ? '1px solid' : 'none', borderColor: 'secondary.light', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', height: 'fit-content', p: '15px 30px', width: '430px' }}>
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
            {`${currency?.sign ?? ''}${nFormatter(allAccountsTotalBalance ?? 0, 2)}`}
          </Typography>}
      </Grid>
      {allAccountsTotalBalance !== 0 && assets && assets.length > 0 &&
        <Grid container item sx={{ borderTop: '1px solid', borderTopColor: borderColor, pt: '10px' }}>
          <Chart assets={assets} borderColor={borderColor} />
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
                <Divider sx={{ bgcolor: borderColor, height: '2px', mt: '10px', width: '100%' }} />
                <Grid alignItems='center' container item onClick={toggleAssets} sx={{ cursor: 'pointer', p: '5px', width: 'fit-content' }}>
                  <Typography fontSize='16px' fontWeight={400}>
                    {t<string>(showMore ? 'Less tokens' : 'More tokens')}
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
