// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import 'chartjs-adapter-date-fns';

import type { ChartOptions, Plugin } from 'chart.js';

import { Typography, useTheme } from '@mui/material';
import { CategoryScale, Chart as ChartJS, LinearScale, LineElement, PointElement, TimeScale, Tooltip } from 'chart.js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';

import { useAlerts, useTranslation } from '@polkadot/extension-polkagate/src/hooks';

import { DraggableModal } from './DraggableModal';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, TimeScale);

interface PricePoint {
  time: number; // timestamp in milliseconds
  value: number;
}

interface TokenChartProps {
  coinId: string; // e.g., 'bitcoin'
  vsCurrency?: string; // e.g., 'usd'
  onClose: React.Dispatch<React.SetStateAction<string | undefined>>;
  intervalSec?: number; // update interval
}

const fetchWithTimeout = (url: string, timeout = 10000) => {
  const controller = new AbortController();
  const signal = controller.signal;

  return new Promise<Response>((resolve, reject) => {
    const timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timeout after ${timeout}ms`));
    }, timeout);

    fetch(url, { signal })
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

const gradientFillPlugin: Plugin<'line'> = {
  beforeDatasetsDraw (chart) {
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

const TokenChart: React.FC<TokenChartProps> = ({ coinId,
  intervalSec = 60,
  onClose,
  vsCurrency = 'usd' }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const chartRef = useRef<ChartJS<'line'>>(null);
  const { notify } = useAlerts();

  const [priceData, setPriceData] = useState<PricePoint[]>([]);

  const fetchPriceData = useCallback(async () => {
    try {
      const res = await fetchWithTimeout(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vsCurrency}&ids=${coinId.toLowerCase()}&sparkline=true`
      );

      const data = await res.json();

      if (!data) {
        notify(t('Something went wrong while fetching token data!'), 'info');

        return;
      }

      const sparkLinePrices = data[0]?.sparkline_in_7d?.price as number[];

      if (!sparkLinePrices) {
        return;
      }

      // Build time series for last 7 days
      const now = Date.now();
      const prices: { time: number; value: number }[] = sparkLinePrices.map(
        (p: number, i: number, arr: number[]) => ({
          time: now - (arr.length - 1 - i) * 60 * 60 * 1000, // approximate hourly timestamps
          value: p
        })
      );

      setPriceData(prices);
    } catch (err: unknown) {
      const isTimeOut = err instanceof Error && err.message.includes('timeout');

      const message =
        isTimeOut
          ? t('Fetching token data timed out. Please try again.')
          : t('Something went wrong while fetching token data!');

      notify(message, isTimeOut ? 'warning' : 'error');
    }
  }, [coinId, notify, t, vsCurrency]);

  useEffect(() => {
    fetchPriceData().catch(console.error);
    const id = window.setInterval(fetchPriceData, intervalSec * 1000);

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
        label: `${coinId.toUpperCase()} Price (${vsCurrency.toUpperCase()})`,
        pointRadius: 0,
        segment: {
          borderColor: (ctx: { p1: { parsed: { y: number; }; }; p0: { parsed: { y: number; }; }; }) => (ctx.p1.parsed.y >= ctx.p0.parsed.y ? '#4caf50' : '#FF3864')
        },
        tension: 0.2
      }
    ],
    labels: priceData.map((p) => new Date(p.time))
  }), [priceData, coinId, vsCurrency]);

  const options: ChartOptions<'line'> = {
    interaction: { intersect: false, mode: 'nearest' },
    plugins: {
      legend: {
        display: false
      },
      tooltip: { intersect: false, mode: 'index' }
    },
    responsive: true,
    scales: {
      x: {
        ticks: {
          callback: function (value: string | number | Date, _index: unknown, _ticks: unknown) {
            // Show only the day and month
            return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
          },
          color: theme.palette.text.highlight,
          font: { family: 'Inter', size: 11, weight: 400 },
          maxTicksLimit: 7, // force exactly 7 labels
          source: 'auto' // calculates tick positions automatically
        },
        time: { tooltipFormat: 'pp', unit: 'day' },
        title: { color: theme.palette.text.secondary, display: true, font: { family: 'Inter', size: 12, weight: 400 }, text: 'Date' },
        type: 'time' as const
      },
      y: {
        ticks: {
          color: theme.palette.text.highlight
        },
        title: { color: theme.palette.text.secondary, display: true, font: { family: 'Inter', size: 12, weight: 400 }, text: `Price (${vsCurrency.toUpperCase()})` }
      }
    }
  };

  useEffect(() => {
    const chart = chartRef.current;

    if (!chart || priceData.length === 0) {
      return;
    }

    const maxIndex = priceData.reduce((maxIdx, point, idx, arr) =>
      point.value > arr[maxIdx].value ? idx : maxIdx, 0
    );

    if (chart.tooltip && chart.scales['x'] && chart.scales['y']) {
      chart.tooltip.setActiveElements(
        [
          {
            datasetIndex: 0,
            index: maxIndex
          }
        ],
        {
          x: chart.scales['x'].getPixelForValue(maxIndex),
          y: chart.scales['y'].getPixelForValue(priceData[maxIndex].value)
        }
      );
      chart.update();
    }
  }, [priceData]);

  const _onClose = useCallback(() => onClose(undefined), [onClose]);

  return (
    <DraggableModal
      onClose={_onClose}
      open={true}
      showBackIconAsClose
      style={{ minHeight: '400px', padding: '20px 20px 6px', width: '677px' }}
      title={`${coinId.toUpperCase()} Price — Last 7 Days`}
    >
      <>
        <Line data={chartData} options={options} plugins={[gradientFillPlugin]} ref={chartRef} />
        <Typography sx={{ color: 'text.disabled', display: 'block', pr: '16px', textAlign: 'right', width: '100%' }} variant='S-2'>
          {t('powered by CoinGecko')}
        </Typography>
      </>
    </DraggableModal>
  );
};

export default TokenChart;
