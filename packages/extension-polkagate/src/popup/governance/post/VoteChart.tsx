// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Chart, registerables } from 'chart.js';
import React, { useEffect, useMemo, useRef } from 'react';

import { BN } from '@polkadot/util';

import { useTranslation } from '../../../hooks';
import { ReferendumSubScan } from '../utils/types';

interface Props {
  referendum: ReferendumSubScan | undefined;
}

export default function VoteChart({ referendum }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const chartRef = useRef(null);

  Chart.register(...registerables);

  const ayesPercent = useMemo(() =>
    referendum
      ? Number(referendum.ayes_amount) / (Number(referendum.ayes_amount) + Number(new BN(referendum.nays_amount))) * 100
      : 0
    , [referendum]);

  const naysPercent = useMemo(() =>
    referendum
      ? Number(referendum.nays_amount) / (Number(referendum.ayes_amount) + Number(new BN(referendum.nays_amount))) * 100
      : 0
    , [referendum]);

  useEffect(() => {
    const chartData = {
      labels: [
        'Aye',
        'Nay',
        // 'Abstain'
      ],
      datasets: [{
        label: 'Percentage',
        data: [ayesPercent, naysPercent],
        backgroundColor: [
          '#008080',
          '#FF5722',
          // '#BBBBBB'
        ],
        hoverOffset: 4
      }]
    };

    const chartOptions = {
      plugins: {
        legend: {
          align: 'center',
          display: true,
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
      responsive: true
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
    <>
      <canvas height='150' id='chartCanvas' ref={chartRef} width='250' />
    </>
  );
}
