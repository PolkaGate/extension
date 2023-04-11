// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Chart } from 'chart.js';
import React, { useEffect, useRef } from 'react';

import { LinearDecreasing, Reciprocal } from '../../hooks/useTracks';

const ThresholdCurves = ({ linearDecreasing, reciprocal }: { reciprocal: Reciprocal, linearDecreasing: LinearDecreasing }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const reciprocalData = {
      factor: 2, // Example value for the reciprocal factor
      xOffset: 0, // Example value for the x-offset
      yOffset: 0 // Example value for the y-offset
    };

    const linearDecreasingData = {
      ceil: 5, // Example value for the ceil
      floor: 1, // Example value for the floor
      length: 5 // Example value for the length
    };

    // Generate data for the reciprocal line
    const reciprocalLineData = [];

    for (let i = 0; i < reciprocalData.length; i++) {
      const x = i + reciprocalData.xOffset;
      const y = reciprocalData.yOffset + (reciprocalData.factor / x);

      reciprocalLineData.push(y);
    }

    // Generate data for the linear decreasing line
    const linearDecreasingLineData = [];

    for (let i = 0; i < linearDecreasingData.length; i++) {
      const x = i + 1;
      const y = linearDecreasingData.ceil - (x * (linearDecreasingData.ceil - linearDecreasingData.floor)) / (linearDecreasingData.length - 1);

      linearDecreasingLineData.push(y);
    }

    const chartData = {
      labels: ['A', 'B', 'C', 'D', 'E'],
      datasets: [
        {
          label: 'Reciprocal Line',
          data: reciprocalLineData,
          borderColor: 'red',
          borderWidth: 1,
          fill: false
        },
        {
          label: 'Linear Decreasing Line',
          data: linearDecreasingLineData,
          borderColor: 'blue',
          borderWidth: 1,
          fill: false
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: Math.max(...reciprocalLineData, ...linearDecreasingLineData)
        }
      }
    };

    const chartInstance = new Chart(chartRef.current, {
      type: 'line',
      data: chartData,
      options: chartOptions
    });

    // Clean up the chart instance on component unmount
    return () => {
      chartInstance.destroy();
    };
  }, []);

  return (
    <div>
      <canvas ref={chartRef} id='chartCanvas' />
    </div>
  );
};

export default ThresholdCurves;
