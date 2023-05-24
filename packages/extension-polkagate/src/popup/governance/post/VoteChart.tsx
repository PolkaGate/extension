// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Pulse } from 'better-react-spinkit';
import { Chart, registerables } from 'chart.js';
import React, { useEffect, useMemo, useRef } from 'react';

import { BN } from '@polkadot/util';

import { ReferendumSubScan } from '../utils/types';

interface Props {
  referendum: ReferendumSubScan | undefined;
}

export default function VoteChart({ referendum }: Props): React.ReactElement<Props> {
  const chartRef = useRef(null);

  Chart.register(...registerables);

  const ayesPercent = useMemo(() => {
    if (referendum) {
      const totalAmount = (Number(referendum.ayes_amount) + Number(new BN(referendum.nays_amount)));

      if (totalAmount === 0) {
        return 0;
      }

      return Number(referendum.ayes_amount) / totalAmount * 100;
    }
  }, [referendum]);

  const naysPercent = useMemo(() => {
    if (referendum) {
      const totalAmount = (Number(referendum.ayes_amount) + Number(new BN(referendum.nays_amount)));

      if (totalAmount === 0) {
        return 0;
      }

      return Number(referendum.nays_amount) / totalAmount * 100;
    }
  }, [referendum]);

  useEffect(() => {
    const chartData = {
      labels: [
        'Aye',
        'Nay'
      ],
      datasets: [{
        backgroundColor: [
          '#008080',
          '#FF5722',
          // '#BBBBBB'
        ],
        data: [ayesPercent, naysPercent],
        hoverOffset: 4,
        label: 'Percentage'
      }]
    };

    const chartOptions = {
      plugins: {
        legend: {
          align: 'center',
          display: false,
          maxHeight: 50,
          maxWidth: '10px',
          position: 'bottom'
        },
        tooltip: {
          bodyFont: {
            displayColors: false,
            family: 'Roboto',
            size: 13,
            weight: 'bold'
          },
          callbacks: {
            label: function (TooltipItem: string | { label: string }[] | undefined) {
              if (!TooltipItem) {
                return;
              }

              return `${TooltipItem.formattedValue} %`;
            },
            title: function (TooltipItem: string | { label: string }[] | undefined) {
              if (!TooltipItem) {
                return;
              }

              return `${TooltipItem[0].label}`;
            }
          },
          displayColors: false,
          // titleColor: theme.palette.mode === 'dark' ? '#000' : '#fff',
          titleFont: {
            displayColors: false,
            family: 'Roboto',
            size: 14,
            weight: 'bold'
          }
        }
      },
      responsive: true,
      rotation: 180
    };

    const chartInstance = new Chart(chartRef.current, {
      data: chartData,
      options: chartOptions,
      type: 'pie'
    });

    // Clean up the chart instance on component unmount
    return () => {
      chartInstance.destroy();
    };
  }, [ayesPercent, naysPercent]);

  return (
    <Grid alignItems='center' container justifyContent='center' sx={{ height: '250px', width: '100%' }} >
      {referendum
        ? <canvas id='chartCanvas' ref={chartRef} />
        : <Grid alignItems='center' container height='100%' item justifyContent='center'>
          <Pulse color={grey[300]} size={80} />
        </Grid>
      }
    </Grid>
  );
}
