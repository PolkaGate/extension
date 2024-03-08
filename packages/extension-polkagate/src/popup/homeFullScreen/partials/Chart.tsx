// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import { Chart, registerables } from 'chart.js';
import React, { useEffect, useRef } from 'react';

interface Props {
  borderColor: 'rgba(255, 255, 255, 0.1)' | 'rgba(0, 0, 0, 0.1)';
  assets: {
    percent: number;
    price: number;
    totalBalance: number;
    ui: {
      color: string | undefined;
      logo: string | undefined;
    };
    assetId?: number | undefined;
    chainName: string;
    decimal: number;
    genesisHash: string;
    priceId: string;
    token: string;
  }[] | undefined;
}

function ChartTotal ({ assets, borderColor }: Props): React.ReactElement {
  const chartRef = useRef(null);

  Chart.register(...registerables);

  useEffect(() => {
    if (!assets || !borderColor) {
      return;
    }

    const chartInstance = new Chart(chartRef.current, {
      data: {
        datasets: [{
          backgroundColor: assets?.map((asset) => asset.ui?.color),
          borderColor,
          borderWidth: 0.9,
          data: assets?.map((asset) => asset.percent),
          hoverOffset: 1
        }]
      },
      options: {
        animation: false,
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

  return (
    <Grid container item sx={{ height: '125px', mr: '5px', width: '125px' }}>
      <canvas id='chartCanvas' ref={chartRef} />
    </Grid>
  );
}

export default React.memo(ChartTotal);
