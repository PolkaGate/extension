// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Chart, registerables } from 'chart.js'; // Import registerables from Chart.js
import React, { useEffect, useRef } from 'react';

import { BN, BN_BILLION, BN_ZERO, bnMax, bnMin } from '@polkadot/util';

import { TrackInfo } from '../../hooks/useTracks';

const ThresholdCurves = ({ trackInfo }: { trackInfo: TrackInfo }) => {
  const reciprocal = trackInfo.minSupport.reciprocal;
  const linearDecreasing = trackInfo.minApproval.linearDecreasing;

  const chartRef = useRef(null);

  // Register the required chart elements
  Chart.register(...registerables);

  useEffect(() => {
    const linearDecreasingData = {
      ceil: linearDecreasing.ceil / (10 ** 7),
      floor: linearDecreasing.floor / (10 ** 7),
      length: linearDecreasing.length / (10 ** 7)
    };

    const xAxis = trackInfo.decisionPeriod / (10 * 60);

    const CURVE_LENGTH = trackInfo.decisionPeriod / 600;
    const support = new Array<BN>(CURVE_LENGTH);
    const last = CURVE_LENGTH;
    let current = new BN(0);
    const x = new Array<BN>(CURVE_LENGTH);
    const step = new BN(trackInfo.decisionPeriod).divn(CURVE_LENGTH);
    const magicMax = 50;//%
    let firstSupport: BN;

    for (let i = 0; i < last; i++) {
      const t = current.mul(BN_BILLION).div(new BN(trackInfo.decisionPeriod));
      const div = t.add(new BN(reciprocal.xOffset));

      if (div.isZero()) {
        support[i] = BN_BILLION;
      } else {
        support[i] = bnMin(
          BN_BILLION,
          bnMax(
            BN_ZERO,
            new BN(reciprocal.factor)
              .mul(BN_BILLION)
              .div(div)
              .sub(new BN(reciprocal.xOffset))
          )
        );
      }

      if (i === 0) {
        firstSupport = support[i];
      }

      support[i] = support[i].muln(magicMax).div(firstSupport).toNumber();

      x[i] = current.divn(600).toNumber();

      current = current.add(step);
    }

    // Generate data for the linear decreasing line
    const linearDecreasingLineData = [];
    for (let i = 0; i < xAxis; i++) {
      const x = i + 1;
      const y = linearDecreasingData.ceil - (x * (linearDecreasingData.ceil - linearDecreasingData.floor)) / (xAxis - 1);

      linearDecreasingLineData.push(y);
    }

    const chartData = {
      labels: x,//Array.from({ length: trackInfo.decisionPeriod / (10 * 60) }, (_, index) => index + 1),
      datasets: [
        {
          borderColor: 'blue',
          borderWidth: 1,
          data: support,
          fill: false,
          label: 'Support',
          pointRadius: 0,
        },
        {
          borderColor: 'green',
          borderWidth: 1,
          data: linearDecreasingLineData,
          fill: false,
          label: 'Approval',
          pointRadius: 0
        }
      ]
    };

    const chartOptions = {
      plugins: {
        legend: {
          display: true,
          align: 'center',
          maxHeight: 50,
          maxWidth: '2px',
          position: 'bottom',
        }
      },
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100//findMaxValue([...support, ...linearDecreasingLineData])
        }
      }
    };

    console.log('chartOptions:',chartOptions)
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

  // Custom function to find the maximum value in an array
  const findMaxValue = (arr) => {
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
        max = arr[i];
      }
    }
    return max;
  };

  return (
    <>
      <canvas ref={chartRef} id='chartCanvas' />
    </>
  );
};

export default React.memo(ThresholdCurves);
