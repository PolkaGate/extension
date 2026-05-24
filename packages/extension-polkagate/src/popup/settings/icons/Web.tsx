// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

const WebIcon = ({ color = '#AA83DC', ...props }) => (
  <svg
    fill='none'
    height='18'
    viewBox='0 0 18 18'
    width='18'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      d='M16.5 9C16.5 4.86 13.14 1.5 9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5'
      stroke={color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.5'
    />
    <path
      d='M5.99995 2.25H6.74995C5.28745 6.63 5.28745 11.37 6.74995 15.75H5.99995'
      stroke={color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.5'
    />
    <path
      d='M11.25 2.25C11.9775 4.44 12.345 6.72 12.345 9'
      stroke={color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.5'
    />
    <path
      d='M2.25 12V11.25C4.44 11.9775 6.72 12.345 9 12.345'
      stroke={color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.5'
    />
    <path
      d='M2.25 6.74995C6.63 5.28745 11.37 5.28745 15.75 6.74995'
      stroke={color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.5'
    />
    <path
      d='M13.65 16.05C14.9755 16.05 16.05 14.9755 16.05 13.65C16.05 12.3245 14.9755 11.25 13.65 11.25C12.3245 11.25 11.25 12.3245 11.25 13.65C11.25 14.9755 12.3245 16.05 13.65 16.05Z'
      stroke={color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.5'
    />
    <path
      d='M16.5 16.5L15.75 15.75'
      stroke={color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.5'
    />
  </svg>
);

export default WebIcon;
