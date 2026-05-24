// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

const Telegram = ({ color = '#34AADF', ...props }) => (
  <svg
    fill='none'
    height='18'
    viewBox='0 0 24 24'
    width='18'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      d='M9.04 14.92L8.66 18.57C9.1 18.57 9.29 18.38 9.52 18.15L11.54 16.19L15.15 18.85C15.82 19.22 16.3 19.03 16.47 18.26L19.46 4.35C19.7 3.36 19.06 2.9 18.41 3.19L3.47 8.93C2.52 9.3 2.53 9.86 3.31 10.1L7.14 11.3L15.77 6.03C16.18 5.78 16.56 5.93 16.25 6.18L9.04 14.92Z'
      fill={color}
    />
  </svg>
);

export default Telegram;