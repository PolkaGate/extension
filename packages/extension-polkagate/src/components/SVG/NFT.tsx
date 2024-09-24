// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import React from 'react';

interface Props {
  color?: string;
  height?: number;
  width?: number;
}

const NFTIcon = ({ color = '#BA2882', height = 15, width = 34 }: Props) => (
  <svg fill='none' height={height} viewBox='0 0 42 36' width={width} xmlns='http://www.w3.org/2000/svg'>
    <path clipRule='evenodd' d='M39 10.0675L21 3.21031L3 10.0675V25.9325L21 32.7897L39 25.9325V10.0675ZM42 28V8L21 0L0 8V28L21 36L42 28Z' fill={color} fillRule='evenodd' />
    <path d='M26.6016 14.6474V12.3633H36.4368V14.6474H32.9084V23.9996H30.1357V14.6474H26.6016Z' fill={color} />
    <path d='M17.6229 23.9996V12.3633H25.566V14.6474H20.4354V17.0337H25.0604V19.3235H20.4354V23.9996H17.6229Z' fill={color} />
    <path d='M15.8544 12.3633V23.9996H13.468L8.83735 17.2837H8.76349V23.9996H5.95099V12.3633H8.37144L12.951 19.0678H13.0476V12.3633H15.8544Z' fill={color} />
  </svg>
);

export default NFTIcon;
