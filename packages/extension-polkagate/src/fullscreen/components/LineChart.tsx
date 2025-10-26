// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import 'chartjs-adapter-date-fns';

import type { ChartOptions } from 'chart.js';

import { CategoryScale, Chart as ChartJS, LinearScale, LineElement, PointElement, TimeScale, Tooltip } from 'chart.js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';

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

const TokenChart: React.FC<TokenChartProps> = ({ coinId,
  intervalSec = 60,
  onClose,
  vsCurrency = 'usd' }) => {
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const intervalRef = useRef<number | null>(null);
  const chartRef = useRef<ChartJS<'line'>>(null);

  const fetchPriceData = useCallback(async () => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vsCurrency}&ids=${coinId?.toLowerCase()}&sparkline=true`
      );
      const data = await res.json();

      if (!data) {
        console.error('no data fetched!');

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
    } catch (err) {
      console.error('Failed to fetch price data:', err);
    }
  }, [coinId, vsCurrency]);

  useEffect(() => {
    fetchPriceData().catch(console.error);
    intervalRef.current = window.setInterval(fetchPriceData, intervalSec * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [coinId, fetchPriceData, intervalSec, vsCurrency]);

const chartData = {
  datasets: [
    {
      backgroundColor: 'rgba(76, 175, 80, 0.2)', // optional fill
      borderColor: '#4caf50', // default, overridden by segment
      data: priceData.map((p) => p.value),
      fill: true,
      label: `${coinId.toUpperCase()} Price (${vsCurrency.toUpperCase()})`,
      pointRadius: 0,
      segment: {
        borderColor: (ctx: { p0: { parsed: { y: number; }; }; p1: { parsed: { y: number; }; }; }) => {
          const current = ctx.p0.parsed.y;
          const next = ctx.p1.parsed.y;

          return next >= current ? '#4caf50' : '#FF3864';
        }
      },
      tension: 0.2
    }
  ],
  labels: priceData.map((p) => new Date(p.time))
};

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
          maxTicksLimit: 7, // force exactly 7 labels
          source: 'auto' // calculates tick positions automatically

        },
        time: { tooltipFormat: 'pp', unit: 'day' },
        title: { display: true, text: 'Date' },
        type: 'time' as const
      },
      y: {
        title: { display: true, text: `Price (${vsCurrency.toUpperCase()})` }
      }
    }
  };

  useEffect(() => {
    if (!chartRef.current || priceData.length === 0) {
 return;
}

    const chart = chartRef.current;
    const maxIndex = priceData.reduce((maxIdx, point, idx, arr) => point.value > arr[maxIdx].value ? idx : maxIdx, 0);

    // Set active tooltip on max price point
    chart.tooltip?.setActiveElements(
      [
        {
          datasetIndex: 0,
          index: maxIndex
        }
      ],
      { x: chart.scales['x'].getPixelForValue(maxIndex), y: chart.scales['y'].getPixelForValue(priceData[maxIndex].value) }
    );
    chart.update();
  }, [priceData]);

  return (
    <DraggableModal
      onClose={() => onClose(undefined)}
      open={true}
      showBackIconAsClose
      style={{ minHeight: '400px', padding: '20px', width: '677px' }}
      title={`${coinId.toUpperCase()} Price`}
    >
      <Line data={chartData} options={options} ref={chartRef} />
    </DraggableModal>
  );
};

export default TokenChart;
