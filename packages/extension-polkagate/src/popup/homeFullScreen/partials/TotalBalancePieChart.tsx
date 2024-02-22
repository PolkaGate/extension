// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
import { Avatar, Box, Collapse, Divider, Grid, Typography, useTheme } from '@mui/material';
import { Chart, registerables } from 'chart.js';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { stars6Black, stars6White } from '../../../assets/icons';
import { AccountsAssetsContext } from '../../../components';
import { nFormatter } from '../../../components/FormatPrice';
import { useCurrency, useTranslation } from '../../../hooks';
import { CHAINS_WITH_BLACK_LOGO, WESTEND_GENESIS_HASH, WESTMINT_GENESIS_HASH } from '../../../util/constants';
import getLogo2 from '../../../util/getLogo2';
import { amountToHuman } from '../../../util/utils';

interface Props {
  hideNumbers: boolean | undefined;
}

type AssetType = {
  balance: number;
  genesishash: string;
  percent: number;
  token: string;
}

function TotalBalancePieChart({ hideNumbers }: Props): React.ReactElement {
  const chartRef = useRef(null);
  const theme = useTheme();
  const { t } = useTranslation();
  const currency = useCurrency();
  const { accountsAssets } = useContext(AccountsAssetsContext);

  Chart.register(...registerables);

  const [showMore, setShowMore] = useState<boolean>(false);

  const calPrice = useCallback((assetPrice: number | undefined, balance: BN, decimal: number) => parseFloat(amountToHuman(balance, decimal)) * (assetPrice ?? 0), []);
  const formatNumber = useCallback((num: number) => {
    return parseFloat(Math.trunc(num) === 0 ? num.toFixed(2) : num.toFixed(1));
  }, []);

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const borderColor = useMemo(() => isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', [isDarkTheme]);
  const allAccountsTotalBalance = useMemo(() => {
    if (!accountsAssets) {
      return undefined;
    }

    let totalPrice = 0;

    accountsAssets.balances.forEach((balance) => {
      balance.assets.forEach((accountAsset) => {
        totalPrice += calPrice(accountAsset.price ?? 0, accountAsset.totalBalance, accountAsset.decimal);
      });
    });

    return totalPrice;
  }, [accountsAssets, calPrice]);

  const assets = useMemo(() => {
    if (!accountsAssets || !allAccountsTotalBalance) {
      return undefined;
    }

    const allAssetsInfo = accountsAssets.balances.flatMap((balance) => balance.assets.map((asset) => ({ token: asset.token, genesis: asset.genesisHash })));
    const removeDup = [...new Set(allAssetsInfo.map((obj) => JSON.stringify(obj)))];
    const assetsInfo = removeDup.map((str) => JSON.parse(str) as { token: string; genesis: string }).filter((value) => ![WESTEND_GENESIS_HASH, WESTMINT_GENESIS_HASH].includes(value.genesis));

    const eachAssetTotal = assetsInfo.map((assetInfo) => {
      let genesishash: string | undefined = '';
      let token: string | undefined = '';
      let decimal: number | undefined = 0;
      let price: number | undefined = 0;

      const balance = accountsAssets.balances.reduce((accumulator, balance) => {
        const asset = balance.assets.find((asset) => asset.genesisHash === assetInfo.genesis && asset.token === assetInfo.token);

        if (!genesishash || !token || !decimal || !price) {
          genesishash = asset?.genesisHash;
          token = asset?.token;
          decimal = asset?.decimal;
          price = asset?.price;
        }

        return accumulator.add(asset?.totalBalance ?? BN_ZERO);
      }, BN_ZERO);

      const balancePrice = calPrice(price, balance, decimal ?? 0);

      return {
        balance: balancePrice,
        genesishash,
        percent: formatNumber((balancePrice / allAccountsTotalBalance) * 100),
        token
      };
    });

    eachAssetTotal.sort((a, b) => {
      if (a.percent < b.percent) {
        return 1;
      } else if (a.percent > b.percent) {
        return -1;
      }

      return 0;
    });

    return eachAssetTotal;
  }, [accountsAssets, allAccountsTotalBalance, calPrice, formatNumber]);

  useEffect(() => {
    const chartInstance = new Chart(chartRef.current, {
      data: {
        datasets: [{
          backgroundColor: ['red', 'green', 'blue', 'white', 'black', 'orange'],
          borderColor,
          borderWidth: 0.9,
          data: assets?.map((asset) => asset.percent),
          hoverOffset: 1
        }]
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const index = context.dataIndex;
                const token = assets?.[index]?.token;

                return token;
              }
            }
          }
        }
      },
      type: 'pie'
    });

    // Clean up the chart instance on component unmount
    return () => {
      chartInstance.destroy();
    };
  }, [assets, borderColor]);

  const toggleAssets = useCallback(() => setShowMore(!showMore), [showMore]);

  const DisplayAssetRow = ({ asset }: { asset: AssetType }) => (
    <Grid container item justifyContent='space-between'>
      <Grid alignItems='center' container item width='fit-content'>
        <Avatar
          src={getLogo2(asset.genesishash, asset.token)?.logo}
          sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(asset.token) && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: 20, width: 20 }}
          variant='square'
        />
        <Typography fontSize='16px' fontWeight={500} pl='5px' width='40px'>
          {asset.token}
        </Typography>
      </Grid>
      <Grid alignItems='center' columnGap='10px' container item width='fit-content'>
        <Typography fontSize='16px' fontWeight={600}>
          {hideNumbers || hideNumbers === undefined ? '****' : `${currency?.sign ?? ''}${nFormatter(asset.balance ?? 0, 2)}`}
        </Typography>
        <Divider orientation='vertical' sx={{ bgcolor: getLogo2(asset.genesishash, asset.token)?.color, height: '21px', m: 'auto', width: '5px' }} />
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
          <Grid container item sx={{ height: '125px', mr: '5px', width: '125px' }}>
            <canvas id='chartCanvas' ref={chartRef} />
          </Grid>
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
