// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable sort-keys */
/* eslint-disable react/jsx-max-props-per-line */

import { Avatar, Divider, Grid, Typography, useTheme } from '@mui/material';
import { ArcElement, Chart } from 'chart.js';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { BN } from '@polkadot/util';

import { nFormatter } from '../../../components/FormatPrice';
import { useTranslation } from '../../../hooks';
import { CHAINS_WITH_BLACK_LOGO } from '../../../util/constants';
import getLogo from '../../../util/getLogo';
import { amountToHuman } from '../../../util/utils';
import { AssetsOnOtherChains } from '..';

interface TotalChartProps {
  isDarkTheme: boolean;
  assetsOnOtherChains: AssetsOnOtherChains[] | undefined;
  nativeAssetPrice: number | undefined;
}

export default function TotalChart ({ assetsOnOtherChains, isDarkTheme, nativeAssetPrice }: TotalChartProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const chartRef = useRef(null);

  Chart.register(ArcElement);

  const calPrice = useCallback((assetPrice: number | undefined, balance: BN, decimal: number) => parseFloat(amountToHuman(balance, decimal)) * (assetPrice ?? 0), []);
  const borderColor = useMemo(() => isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', [isDarkTheme]);

  const getChartColor = useCallback((assetToken: string): string => {
    switch (assetToken) {
      case 'KSM':
        return '#000000';
        break;
      case 'DOT':
        return '#e6007a';
        break;
      case 'ACA':
        return '#645AFF';
        break;
      case 'WND':
        return '#da68a7';
        break;
      default:
        return 'green';
        break;
    }
  }, []);

  const otherAssetsToShow = useMemo(() => {
    if (!assetsOnOtherChains || assetsOnOtherChains.length === 0) {
      return { color: [], name: [], price: [], token: [] };
    } else {
      const assets: { price: number[], color: string[], name: string[], token: string[] } = { color: [], name: [], price: [], token: [] };
      const nonZeroAssets = assetsOnOtherChains.filter((asset) => !asset.totalBalance.isZero());

      nonZeroAssets.forEach((asset) => {
        assets.price.push((calPrice(asset.price, asset.totalBalance, asset.decimal)));
        assets.color.push(getChartColor(asset.token));
        assets.name.push(asset.chainName);
        assets.token.push(asset.token);
      });

      return assets;
    }
  }, [assetsOnOtherChains, calPrice, getChartColor]);

  const topThreePercentages = useMemo(() => {
    if (otherAssetsToShow.price.length === 0) {
      return undefined;
    }

    const formatNumber = (num: number) => parseFloat(Math.trunc(num) === 0 ? num.toFixed(2) : num.toFixed(1));

    let totalPrice = 0;

    otherAssetsToShow.price.forEach((price) => {
      totalPrice += price;
    });

    const combinedArray = otherAssetsToShow.price.map((pri, index) => ({
      color: otherAssetsToShow.color[index],
      name: otherAssetsToShow.name[index],
      price: pri,
      token: otherAssetsToShow.token[index]
    }));

    combinedArray.sort((a, b) => b.price - a.price);
    const nonZeroPrice = combinedArray.filter((asset) => asset.price > 0);

    if (nonZeroPrice.length > 3) {
      nonZeroPrice.length = 3;
    }

    return {
      color: nonZeroPrice.map((item) => item.color),
      name: nonZeroPrice.map((item) => item.name),
      percentage: nonZeroPrice.map((item) => formatNumber((item.price / totalPrice) * 100)),
      token: nonZeroPrice.map((item) => item.token)
    };
  }, [otherAssetsToShow]);

  const allChainTotalBalance = useMemo(() => {
    if (nativeAssetPrice === undefined && otherAssetsToShow.price.length === 0) {
      return undefined;
    } else if (otherAssetsToShow.price.length === 0) {
      return nFormatter(nativeAssetPrice ?? 0, 2);
    } else {
      let totalPrice = 0;

      otherAssetsToShow.price.forEach((price) => {
        totalPrice += price;
      });

      return nFormatter(totalPrice, 2);
    }
  }, [nativeAssetPrice, otherAssetsToShow]);

  useEffect(() => {
    const chartInstance = new Chart(chartRef.current, {
      data: {
        datasets: [{
          backgroundColor: otherAssetsToShow.color,
          borderColor,
          borderWidth: 0.9,
          data: otherAssetsToShow.price,
          hoverOffset: 1
        }]
      },
      options: {
        cutout: 22,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const index = otherAssetsToShow.color.findIndex((val) => val === context.element.options.backgroundColor);

                console.log('context:', context);

                return otherAssetsToShow.token[index];
              }
            }
          }
        }
      },
      type: 'doughnut'
    });

    // Clean up the chart instance on component unmount
    return () => {
      chartInstance.destroy();
    };
  }, [borderColor, otherAssetsToShow.price, otherAssetsToShow.price.length, otherAssetsToShow.color, otherAssetsToShow.color.length, otherAssetsToShow.token]);

  return (
    <Grid alignItems='center' container direction='column' item justifyContent='center' sx={{ bgcolor: 'background.paper', border: isDarkTheme ? '1px solid' : 'none', borderColor: 'secondary.light', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', height: '185px', p: '15px', width: '275px' }}>
      <Grid alignItems='center' container gap='15px' item justifyContent='center'>
        <Typography fontSize='18px' fontWeight={400}>
          {t<string>('Total')}
        </Typography>
        <Typography fontSize='36px' fontWeight={700}>
          {`$${allChainTotalBalance ?? 0}`}
        </Typography>
      </Grid>
      <Grid container item sx={{ borderTop: '1px solid', borderTopColor: borderColor, pt: '10px' }}>
        <Grid container item sx={{ height: '85px', mr: '5px', width: '85px' }}>
          <canvas id='chartCanvas' ref={chartRef} />
        </Grid>
        <Grid container item xs>
          {topThreePercentages && topThreePercentages.name.map((asset, index) => (
            <Grid container item justifyContent='space-between' key={index}>
              <Grid alignItems='center' container item width='fit-content'>
                <Avatar
                  src={getLogo(asset)}
                  sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(asset) && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: 20, width: 20 }}
                  variant='square'
                />
                <Typography fontSize='16px' fontWeight={500} pl='5px' width='40px'>
                  {topThreePercentages.token[index]}
                </Typography>
              </Grid>
              <Divider orientation='vertical' sx={{ bgcolor: getChartColor(topThreePercentages.token[index]), height: '21px', m: 'auto', width: '5px' }} />
              <Typography fontSize='16px' fontWeight={400} m='auto' width='40px'>
                {`${topThreePercentages.percentage[index]}%`}
              </Typography>
            </Grid>
          ))
          }
        </Grid>
      </Grid>
    </Grid>
  );
}
