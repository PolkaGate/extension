// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

const XIcon = ({ color = '#000000', ...props }) => (
  <svg
    fill='none'
    height='18'
    viewBox='0 0 24 24'
    width='18'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      d='M18.36 2H21l-6.55 7.48L21.5 22h-5.64l-4.18-6.26L6.9 22H3.25l7.05-8.05L2.75 2h5.64l3.84 5.79L18.36 2Z'
      fill={color}
    />
  </svg>
);

export default XIcon;
