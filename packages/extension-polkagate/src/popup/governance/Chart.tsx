// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Chart, registerables } from 'chart.js'; // Import registerables from Chart.js
import React, { useEffect, useRef } from 'react';

import { LinearDecreasing, Reciprocal } from '../../hooks/useTracks';

const ThresholdCurves = ({ linearDecreasing, reciprocal }: { reciprocal: Reciprocal, linearDecreasing: LinearDecreasing }) => {
  const chartRef = useRef(null);

  console.log('linearDecreasing, reciprocal');
  console.log(linearDecreasing, reciprocal);
  // Register the required chart elements
  Chart.register(...registerables);

  useEffect(() => {
    const reciprocalData = {
      factor:7,// reciprocal.factor / (10 * 60 * 60*100),
      xOffset:1493,// reciprocal.xOffset / (10 * 60 * 60),
      yOffset: -746// reciprocal.yOffset / (10 * 60 * 60)
    };

    const linearDecreasingData = {
      ceil: 2777,//linearDecreasing.ceil / (10 * 60 * 60),
      floor: 13888,//linearDecreasing.floor / (10 * 60 * 60),
      length: 277//linearDecreasing.length / (10 * 60 * 60*100)
    };

    console.log("reciprocalData:", reciprocalData)
    console.log("linearDecreasingData:", linearDecreasingData);

    // Generate data for the reciprocal line
    const reciprocalLineData = [];

    for (let i = 0; i < reciprocal.factor; i++) {
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
          max: 100//findMaxValue([...reciprocalLineData, ...linearDecreasingLineData])
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
  }, [linearDecreasing.ceil, linearDecreasing.floor, linearDecreasing.length, reciprocal.factor, reciprocal.xOffset, reciprocal.yOffset]);

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
    <div>
      <canvas ref={chartRef} id='chartCanvas' />
    </div>
  );
};

export default ThresholdCurves;
