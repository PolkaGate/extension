// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import React from 'react';

interface Props {
  color?: string;
  height?: number;
  width?: number;
  scale?: number;
}

const ShowIcon = ({ color = '#BA2882', height = 15, scale = 1, width = 34 }: Props) => (
  <svg fill='none' height={height} transform={`scale(${scale})`} viewBox={`0 0 ${width} ${height}`} width={width} xmlns='http://www.w3.org/2000/svg'>
    <rect fill={color} height='0.900901' rx='0.45045' width='26' x='4' y='15.0991' />
    <rect fill={color} height='1.81818' width='5.21739' x='5' y='13.1819' />
    <rect fill={color} height='1.81818' width='5.21739' x='7.08691' y='10.4546' />
    <rect fill={color} height='1.81818' width='5.21739' x='5' y='7.72729' />
    <rect fill={color} height='1.81818' width='3.13043' x='5' y='5' />
    <rect fill={color} height='1.81818' width='5.21739' x='9.17383' y='5' />
    <rect fill={color} height='1.81818' width='5.21739' x='15.4346' y='5' />
    <rect fill={color} height='1.81818' width='5.21739' x='21.6958' y='5' />
    <rect fill={color} height='1.81818' width='5.21739' x='11.2607' y='7.72729' />
    <rect fill={color} height='1.81818' width='5.21739' x='13.3477' y='10.4546' />
    <rect fill={color} height='1.81818' width='5.21739' x='17.522' y='7.72729' />
    <rect fill={color} height='1.81818' width='5.21739' x='19.6089' y='10.4546' />
    <rect fill={color} height='1.81818' width='5.21739' x='17.522' y='13.1819' />
    <rect fill={color} height='1.81818' width='5.21739' x='23.7827' y='13.1819' />
    <rect fill={color} height='1.81818' width='5.21739' x='23.7827' y='7.72729' />
    <rect fill={color} height='1.81818' width='3.13043' x='25.8696' y='10.4546' />
    <rect fill={color} height='1.81818' width='1.04348' x='5' y='10.4546' />
    <rect fill={color} height='1.81818' width='1.04348' x='27.9565' y='5' />
    <rect fill={color} height='1.81818' width='5.21739' x='11.2607' y='13.1819' />
  </svg>
);

export default ShowIcon;
