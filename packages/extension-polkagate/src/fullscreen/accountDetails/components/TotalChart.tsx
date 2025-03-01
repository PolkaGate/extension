// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable sort-keys */
/* eslint-disable react/jsx-max-props-per-line */

import type { FetchedBalance } from '../../../hooks/useAssetsBalances';
import type { Prices } from '../../../util/types';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import { Chart, registerables } from 'chart.js';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import CountUp from 'react-countup';

import { AssetLogo } from '../../../components';
import FormatPrice from '../../../components/FormatPrice';
import { useCurrency, useTranslation } from '../../../hooks';
import { calcChange, calcPrice } from '../../../hooks/useYouHave';
import { COIN_GECKO_PRICE_CHANGE_DURATION } from '../../../util/api/getPrices';
import { DEFAULT_COLOR } from '../../../util/constants';
import getLogo2 from '../../../util/getLogo2';
import { countDecimalPlaces, fixFloatingPoint } from '../../../util/utils';
import { adjustColor, changeSign, PORTFOLIO_CHANGE_DECIMAL } from '../../homeFullScreen/partials/TotalBalancePieChart';

interface Props {
  accountAssets: FetchedBalance[] | null | undefined;
  pricesInCurrency: Prices | null | undefined
}

interface AssetsToShow extends FetchedBalance {
  worth: number;
  percentage: number;
  color: string
}

export default function TotalChart({ accountAssets, pricesInCurrency }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const chartRef = useRef(null);
  const currency = useCurrency();

  Chart.register(...registerables);

  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);
  const changePriceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.change || 0, [pricesInCurrency?.prices]);
  const formatNumber = useCallback((num: number): number => parseFloat(Math.trunc(num) === 0 ? num.toFixed(2) : num.toFixed(1)), []);

  const { assets, totalChange, totalWorth } = useMemo(() => {
    if (accountAssets?.length) {
      const _assets = accountAssets as unknown as AssetsToShow[];

      let total = 0;
      let totalChange = 0;

      /** to add asset's worth and color */
      accountAssets.forEach((asset, index) => {
        const assetWorth = calcPrice(priceOf(asset.priceId), asset.totalBalance, asset.decimal);
        const assetColor = getLogo2(asset.genesisHash, asset.token)?.color || DEFAULT_COLOR;

        _assets[index].worth = assetWorth;
        _assets[index].color = adjustColor(asset.token, assetColor, theme);

        total += assetWorth;

        totalChange += calcChange(priceOf(asset.priceId), Number(asset.totalBalance) / (10 ** asset.decimal), changePriceOf(asset.priceId));
      });

      /** to add asset's percentage */
      _assets.forEach((asset) => {
        asset.percentage = formatNumber((asset.worth / total) * 100);

        return asset;
      });

      _assets.sort((a, b) => b.worth - a.worth);
      const nonZeroAssets = _assets.filter((asset) => asset.worth > 0);

      return { assets: nonZeroAssets, totalChange, totalWorth: total };
    }

    return { assets: undefined, totalChange: 0, totalWorth: undefined };
  }, [accountAssets, changePriceOf, formatNumber, priceOf, theme]);

  useEffect(() => {
    const worths = assets?.map(({ worth }) => worth);
    const colors = assets?.map(({ color }) => color);

    // @ts-ignore
    const chartInstance = new Chart(chartRef.current, {
      data: {
        datasets: [{
          backgroundColor: colors,
          borderColor: theme.palette.divider,
          borderWidth: 0.9,
          data: worths,
          hoverOffset: 1
        }]
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const index = colors?.findIndex((val) => val === context.element.options['backgroundColor']);

                return index && index !== -1 ? assets?.[index]?.token : 'UNIT';
              }
            }
          }
        }
      },
      type: 'pie'
    });

    return () => {
      chartInstance.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets?.length, theme.palette.divider]);

  const accountBalanceTotalChange = useMemo(() => {
    if (!totalChange) {
      return 0;
    }

    const value = fixFloatingPoint(totalChange, PORTFOLIO_CHANGE_DECIMAL, false, true);

    return parseFloat(value);
  }, [totalChange]);

  return (
    <Grid alignItems='center' container direction='column' item justifyContent='center' sx={{ bgcolor: 'background.paper', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', p: '10px 15px', width: 'inherit' }}>
      <Grid alignItems='flex-start' container item justifyContent='space-between' mb='10px'>
        <Grid alignItems='center' item>
          <Typography sx={{ fontSize: '20px', fontVariant: 'small-caps', fontWeight: 400 }}>
            {t('Balance')}
          </Typography>
        </Grid>
        <Grid alignItems='center' item justifyItems='flex-end'>
          <FormatPrice
            commify
            fontSize='26px'
            fontWeight={600}
            num={totalWorth}
            skeletonHeight={22}
            withCountUp
            withSmallDecimal
          />
          <Typography sx={{ color: !totalChange ? 'secondary.contrastText' : totalChange > 0 ? 'success.main' : 'warning.main', fontSize: '15px', fontWeight: 500, mt: '10px' }}>
            <CountUp
              decimals={countDecimalPlaces(accountBalanceTotalChange) || PORTFOLIO_CHANGE_DECIMAL}
              duration={1}
              end={accountBalanceTotalChange}
              prefix={`${changeSign(totalChange)}${currency?.sign}`}
              suffix={`(${COIN_GECKO_PRICE_CHANGE_DURATION}h)`}
            />
          </Typography>
        </Grid>
      </Grid>
      {assets && assets.length > 0 &&
        <Grid container item sx={{ borderTop: '1px solid', borderTopColor: 'divider', py: '5px' }}>
          <Grid container item sx={{ height: '85px', mr: '5px', width: '85px' }}>
            <canvas id='chartCanvas' ref={chartRef} />
          </Grid>
          <Grid container item xs>
            {assets.slice(0, 3).map(({ color, genesisHash, percentage, token }, index) => {
              const logoInfo = getLogo2(genesisHash, token);

              return (
                <Grid container item justifyContent='space-between' key={index} mt='5px'>
                  <Grid alignItems='center' container item width='fit-content'>
                    <AssetLogo assetSize='20px' baseTokenSize='14px' genesisHash={genesisHash} logo={logoInfo?.logo} subLogo={logoInfo?.subLogo} />
                    <Typography fontSize='16px' fontWeight={500} pl='5px' width='60px'>
                      {token}
                    </Typography>
                  </Grid>
                  <Divider orientation='vertical' sx={{ bgcolor: color, height: '21px', m: 'auto', width: '5px' }} />
                  <Typography fontSize='16px' fontWeight={400} m='auto' width='40px'>
                    {`${percentage}%`}
                  </Typography>
                </Grid>
              );
            })
            }
          </Grid>
        </Grid>
      }
    </Grid>
  );
}
