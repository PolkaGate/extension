// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PalletReferendaCurve, PalletReferendaTrackInfo } from '@polkadot/types/lookup';

import { Chart, registerables } from 'chart.js';
import React, { useEffect, useRef } from 'react';

import { BN, BN_BILLION, BN_ZERO, bnMax, bnMin } from '@polkadot/util';

export function curveThreshold(curve: PalletReferendaCurve, input: BN, div: BN): BN {
  // if divisor is zero, we return the max
  if (div.isZero()) {
    return BN_BILLION;
  }

  const x = input.mul(BN_BILLION).div(div);

  if (curve.isLinearDecreasing) {
    const { ceil, floor, length } = curve.asLinearDecreasing;

    return ceil.sub(
      bnMin(x, length)
        .mul(ceil.sub(floor))
        .div(length)
    );
  } else if (curve.isSteppedDecreasing) {
    const { begin, end, period, step } = curve.asSteppedDecreasing;

    // (*begin - (step.int_mul(x.int_div(*period))).min(*begin)).max(*end)
    return bnMax(
      end,
      begin.sub(
        bnMin(
          begin,
          step
            .mul(x)
            .div(period)
        )
      )
    );
  } else if (curve.asReciprocal) {
    const { factor, xOffset, yOffset } = curve.asReciprocal;
    const div = x.add(xOffset);

    if (div.isZero()) {
      return BN_BILLION;
    }

    return bnMin(
      BN_BILLION,
      factor
        .mul(BN_BILLION)
        .div(div)
        .add(yOffset)
    );
  }

  throw new Error(`Unknown curve found ${curve.type}`);
}

const ThresholdCurves = ({ trackInfo }: { trackInfo: PalletReferendaTrackInfo }) => {
  const chartRef = useRef(null);

  // Register the required chart elements
  Chart.register(...registerables);

  useEffect(() => {
    const { decisionPeriod, minApproval, minSupport } = trackInfo;
    const CURVE_LENGTH = decisionPeriod.divn(10 * 60).toNumber();

    const approval = new Array<BN>(CURVE_LENGTH);
    const support = new Array<BN>(CURVE_LENGTH);
    const x = new Array<BN>(CURVE_LENGTH);
    const step = decisionPeriod.divn(CURVE_LENGTH);
    const last = CURVE_LENGTH;
    let current = new BN(0);

    for (let i = 0; i <= last; i++) {
      approval[i] = curveThreshold(minApproval, current, decisionPeriod);
      support[i] = curveThreshold(minSupport, current, decisionPeriod);
      x[i] = current;

      current = current.add(step);
    }

    // since we may be lossy with the step, we explicitly calc the final point at 100%
    approval[last] = curveThreshold(minApproval, decisionPeriod, decisionPeriod);
    support[last] = curveThreshold(minSupport, decisionPeriod, decisionPeriod);
    x[last] = decisionPeriod;

    support[last] = support[last].isNeg() ? BN_ZERO : support[last];

    const approvalY = approval.map((i) => i.divn(10000000).toNumber());
    const supportY = support.map((i) => i.toNumber() / 10000000);

    const chartData = {
      labels: Array.from({ length: CURVE_LENGTH }, (_, index) => index + 1),
      datasets: [
        {
          borderColor: 'blue',
          borderWidth: 1,
          data: supportY,
          fill: false,
          label: 'Support',
          pointRadius: 0,
        },
        {
          borderColor: 'green',
          borderWidth: 1,
          data: approvalY,
          fill: false,
          label: 'Approval',
          pointRadius: 0
        }
      ]
    };

    const chartOptions = {
      plugins: {
        legend: {
          align: 'center',
          display: true,
          maxHeight: 50,
          maxWidth: '2px',
          position: 'bottom'
        },
        tooltip: {
          // backgroundColor: theme.palette.mode === 'dark' ? '#fff' : '#000',
          // bodyColor: theme.palette.mode === 'dark' ? '#000' : '#fff',
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

              console.log('TooltipItem:', TooltipItem)
              return `${TooltipItem.dataset.label}: ${TooltipItem.formattedValue} %`;
            },
            title: function (TooltipItem: string | { label: string }[] | undefined) {
              if (!TooltipItem) {
                return;
              }

              return `Time: ${TooltipItem[0].label} hrs`;
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
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          max: 100,//findMaxValue([...support, ...linearDecreasingLineData]),
          min: 0,
          grid: {
            display: false
          }
        }
      }
    };

    const chartInstance = new Chart(chartRef.current, {
      data: chartData,
      options: chartOptions,
      type: 'line'
    });

    // Clean up the chart instance on component unmount
    return () => {
      chartInstance.destroy();
    };
  }, [trackInfo]);

  return (
    <>
      <canvas height='150' id='chartCanvas' ref={chartRef} width='250' />
    </>
  );
};

export default React.memo(ThresholdCurves);
