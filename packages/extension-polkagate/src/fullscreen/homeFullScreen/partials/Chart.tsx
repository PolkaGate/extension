// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, useTheme } from '@mui/material';
import { Chart, registerables } from 'chart.js';
import React, { useEffect, useRef } from 'react';

interface Props {
  assets: {
    percent: number;
    price: number;
    totalBalance: number;
    ui: {
      color: string | undefined;
      logo: string | undefined;
    };
    assetId?: number | string | undefined;
    chainName: string;
    decimal: number;
    genesisHash: string;
    priceId: string;
    token: string;
  }[] | undefined;
}

function ChartTotal({ assets }: Props): React.ReactElement {
  const chartRef = useRef(null);
  const theme = useTheme();

  Chart.register(...registerables);

  useEffect(() => {
    if (!assets || !chartRef.current) {
      return;
    }

    const chartInstance = new Chart(chartRef.current, {
      data: {
        datasets: [{
          backgroundColor: assets?.map((asset) => asset.ui?.color),
          borderColor: theme.palette.divider,
          borderWidth: 0.9,
          data: assets?.map((asset) => asset.percent),
          hoverOffset: 1
        }]
      },
      options: {
        animation: false,
        cutout: '75%',
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
      type: 'doughnut'
    });

    // Clean up the chart instance on component unmount
    return () => {
      chartInstance.destroy();
    };
  }, [assets, theme.palette.divider]);

  return (
    <Grid container item sx={{ height: '120px', mr: '5px', width: '120px' }}>
      <canvas id='chartCanvas' ref={chartRef} />
    </Grid>
  );
}

export default React.memo(ChartTotal);
