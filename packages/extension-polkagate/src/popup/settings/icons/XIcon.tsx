// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

const XIcon = ({ color = '#AA83DC', ...props }) => (
  <svg
    fill='none'
    height='16'
    viewBox='0 0 16 16'
    width='16'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      d='M9.31742 6.7749L15.1457 0H13.7646L8.70388 5.88257L4.66193 0H0L6.11223 8.89546L0 16H1.3812L6.72543 9.78782L10.994 16H15.656L9.31706 6.7749H9.31742ZM1.87885 1.03975H4.00028L13.7652 15.0075H11.6438L1.87885 1.03975Z'
      fill={color}
    />
  </svg>
);

export default XIcon;
