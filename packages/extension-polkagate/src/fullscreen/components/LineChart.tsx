// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import 'chartjs-adapter-date-fns';

import type { ChartOptions, Plugin, TooltipItem } from 'chart.js';

import { ToggleButton, ToggleButtonGroup, Typography, useTheme } from '@mui/material';
import { CategoryScale, Chart as ChartJS, LinearScale, LineElement, PointElement, TimeScale, Tooltip } from 'chart.js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';

import { useAlerts, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { COINGECKO_WEB } from '@polkadot/extension-polkagate/src/util/constants';

import { DraggableModal } from './DraggableModal';
import SineWaveLoader from './SineWaveLoader';
import { fetchWithTimeout } from './utils';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, TimeScale);

interface MarketChartResponse {
  prices: [number, number][];
}
interface PricePoint {
  time: number; // timestamp in milliseconds
  value: number;
}

interface TokenChartProps {
  coinId: string; // e.g., 'bitcoin'
  logo?: string;
  vsCurrency?: string; // e.g., 'usd'
  onClose: React.Dispatch<React.SetStateAction<string | undefined>>;
  intervalSec?: number; // update interval
}

const gradientFillPlugin: Plugin<'line'> = {
  beforeDatasetsDraw(chart) {
    const { chartArea: { bottom, top }, ctx } = chart;

    if (!chart.data.datasets.length) {
      return;
    }

    const dataset = chart.data.datasets[0];

    if (!dataset.data || dataset.data.length === 0) {
      return;
    }

    ctx.save();
    ctx.beginPath();

    // Move to first point
    const firstPoint = chart.getDatasetMeta(0).data[0];

    if (!firstPoint) {
      ctx.restore();

      return;
    }

    ctx.moveTo(firstPoint.x, bottom);

    // Draw line through points
    chart.getDatasetMeta(0).data.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });

    // Line down to bottom at last point
    const lastPoint = chart.getDatasetMeta(0).data[chart.getDatasetMeta(0).data.length - 1];

    ctx.lineTo(lastPoint.x, bottom);

    // Close path back to first point bottom
    ctx.closePath();

    // Create gradient from top to bottom
    const gradient = ctx.createLinearGradient(0, top, 0, bottom);

    gradient.addColorStop(0, 'rgba(76, 175, 80, 0.4)');
    gradient.addColorStop(0.5, 'rgba(76, 175, 80, 0.25)');
    gradient.addColorStop(1, 'rgba(76, 175, 80, 0)');

    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();
  },
  id: 'gradientFillPlugin'
};

const TokenChart: React.FC<TokenChartProps> = ({ coinId, intervalSec = 60, logo, onClose, vsCurrency = 'usd' }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const chartRef = useRef<ChartJS<'line'>>(null);
  const { notify } = useAlerts();

  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [selectedRange, setSelectedRange] = useState<number>(7);

  useEffect(() => {
    if (!logo) {
      setLogoImage(null);

      return;
    }

    const img = new Image();

    img.onload = () => {
      setLogoImage(img);
    };
    img.onerror = () => {
      setLogoImage(null);
    };
    img.src = logo;

    return () => {
      setLogoImage(null);
    };
  }, [logo]);

  const fetchPriceData = useCallback(async() => {
    try {
      const days = selectedRange;

      const res = await fetchWithTimeout(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}`
      );

      if (!res.ok) {
        if (res.status === 429) {
          notify(t('Rate limited by CoinGecko. Please try again shortly.'), 'warning');
        } else {
          notify(t(`Failed to fetch token data (status ${res.status}).`), 'error');
        }

        return;
      }

      const raw: unknown = await res.json();
      const data = raw as MarketChartResponse;

      if (!data.prices || !Array.isArray(data.prices)) {
        notify(t('Something went wrong while fetching token data!'), 'info');

        return;
      }

      const maybePrices = data.prices;

      if (!maybePrices) {
        notify(t('Sparkline data not available for this token.'), 'info');

        return;
      }

      let prices: PricePoint[] = [];

      if (Array.isArray(maybePrices)) {
        prices = maybePrices.map(([time, value]) => ({
          time,
          value
        }));
      }

      setPriceData(prices);
    } catch (err: unknown) {
      const isTimeOut = err instanceof Error && err.message.includes('timeout');

      const message =
        isTimeOut
          ? t('Fetching token data timed out. Please try again.')
          : t('Something went wrong while fetching token data!');

      notify(message, isTimeOut ? 'warning' : 'error');
    }
  }, [coinId, notify, selectedRange, t, vsCurrency]);

  useEffect(() => {
    fetchPriceData().catch(console.error);
    const id = window.setInterval(() => {
      fetchPriceData().catch(console.error);
    }, intervalSec * 1000);

    return () => {
      clearInterval(id);
    };
  }, [coinId, fetchPriceData, intervalSec, vsCurrency]);

  const chartData = React.useMemo(() => ({
    datasets: [
      {
        backgroundColor: 'transparent',
        borderColor: '#4caf50',
        data: priceData.map((p) => p.value),
        fill: false, // no fill here, plugin will handle gradient fill
        pointRadius: 0,
        segment: {
          borderColor: (ctx: { p1: { parsed: { y: number; }; }; p0: { parsed: { y: number; }; }; }) => (ctx.p1.parsed.y >= ctx.p0.parsed.y ? '#4caf50' : '#FF3864')
        },
        tension: 0.2
      }
    ],
    labels: priceData.map((p) => new Date(p.time))
  }), [priceData]);

  const logoWatermarkPlugin = React.useMemo<Plugin<'line'>>(() => ({
    beforeDatasetDraw(chart) {
      const { chartArea, ctx } = chart;

      if (!chartArea || !logoImage) {
        return;
      }

      const { bottom, left, right, top } = chartArea;
      const chartWidth = right - left;
      const chartHeight = bottom - top;

      if (chartWidth < 120 || chartHeight < 120) {
        return;
      }

      const imageSize = Math.min(chartWidth, chartHeight) * 0.36;
      const x = left + (chartWidth - imageSize) / 2;
      const y = top + (chartHeight - imageSize) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.rect(left, top, chartWidth, chartHeight);
      ctx.clip();
      ctx.globalAlpha = theme.palette.mode === 'dark' ? 0.1 : 0.075;
      ctx.drawImage(logoImage, x, y, imageSize, imageSize);
      ctx.restore();
    },
    id: 'logoWatermarkPlugin'
  }), [logoImage, theme.palette.mode]);

  const options: ChartOptions<'line'> = {
    interaction: { intersect: false, mode: 'nearest' },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const value = context.parsed.y.toFixed(2);
            const currency = vsCurrency.toUpperCase();

            return ` ${value} ${currency}`;
          },
          title: (items: TooltipItem<'line'>[]) => {
            if (!items.length) {
              return '';
            }

            const date = new Date(items[0].parsed.x);

            return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
          }
        },
        intersect: false,
        mode: 'index'
      }
    },
    responsive: true,
    scales: {
      x: {
        ticks: {
          callback: function(value: string | number | Date, _index: unknown, _ticks: unknown) {
            // Show only the day and month
            return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
          },
          color: theme.palette.text.highlight,
          font: { family: 'Inter', size: 11, weight: 400 },
          maxTicksLimit: selectedRange === 7
            ? 7
            : selectedRange === 30
              ? 6
              : 12,
          source: 'data'
        },
        time: { tooltipFormat: 'PPP', unit: 'day' },
        // title: { color: theme.palette.text.secondary, display: true, font: { family: 'Inter', size: 12, weight: 400 }, text: 'Date' },
        type: 'time' as const
      },
      y: {
        ticks: {
          color: theme.palette.text.highlight
        },
        title: { color: theme.palette.text.secondary, display: true, font: { family: 'Inter', size: 12, weight: 400 }, text: t('Price ({{currency}})', { replace: { currency: vsCurrency.toUpperCase() } }) }
      }
    }
  };

  useEffect(() => {
    const chart = chartRef.current;

    if (!chart) {
      return;
    }

    if (logoImage) {
      chart.update();
    }
  }, [logoImage]);

  useEffect(() => {
    const chart = chartRef.current;

    if (!chart || priceData.length === 0) {
      return;
    }

    const maxIndex = priceData.reduce((maxIdx, point, idx, arr) =>
      point.value > arr[maxIdx].value ? idx : maxIdx, 0
    );

    if (chart.tooltip) {
      const el = chart.getDatasetMeta(0).data[maxIndex];

      if (!el) {
        return;
      }

      const point = el as PointElement;

      chart.tooltip.setActiveElements(
        [{ datasetIndex: 0, index: maxIndex }],
        { x: point.x, y: point.y }
      );
      chart.update();
    }
  }, [priceData]);

  const _onClose = useCallback(() => onClose(undefined), [onClose]);
  const btnStyle = { color: theme.palette.text.secondary, fontFamily: 'Inter', fontSize: 12, fontWeight: 400 };

  return (
    <DraggableModal
      closeOnAnyWhereClick
      onClose={_onClose}
      open={true}
      showBackIconAsClose
      style={{ left: (window.innerWidth - 677) / 2, minHeight: '400px', padding: '20px 20px 6px', width: '677px' }}
      title={t('{{coinId}} Price — Last {{selectedRange}} Days', { replace: { coinId: coinId.toUpperCase(), selectedRange } })}
    >
      <>
        {priceData.length === 0
          ? (
            <SineWaveLoader height={300} width={637} />
          )
          : (
            <Line data={chartData} options={options} plugins={[logoWatermarkPlugin, gradientFillPlugin]} ref={chartRef} />
          )}
        <ToggleButtonGroup
          aria-label='Time range'
          exclusive
          // eslint-disable-next-line react/jsx-no-bind, @typescript-eslint/no-unsafe-return
          onChange={(_e, value) => value && setSelectedRange(value as number)}
          size='small'
          sx={{ mt: '10px' }}
          value={selectedRange}
        >
          <ToggleButton sx={btnStyle} value={7}>{t('Week')}</ToggleButton>
          <ToggleButton sx={btnStyle} value={30}>{t('Month')}</ToggleButton>
          <ToggleButton sx={btnStyle} value={365}>{t('Year')}</ToggleButton>
        </ToggleButtonGroup>
        <Typography
          component='a'
          href={`${COINGECKO_WEB}${coinId}`}
          rel='noopener noreferrer'
          sx={{
            '&:hover': { textDecoration: 'underline' },
            color: 'text.disabled',
            display: 'block',
            mt: '-10px',
            pr: '16px',
            textAlign: 'right',
            textDecoration: 'none',
            width: '100%'
          }}
          target='_blank'
          variant='S-2'
        >
          {t('powered by CoinGecko')}
        </Typography>
      </>
    </DraggableModal>
  );
};

export default TokenChart;
