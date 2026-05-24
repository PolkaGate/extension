// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

const Email = ({ color = '#AA83DC', ...props }) => (
  <svg
    fill='none'
    height='18'
    viewBox='0 0 18 18'
    width='18'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      d='M12.75 2.625H5.25C3 2.625 1.5 3.75 1.5 6.375V11.625C1.5 14.25 3 15.375 5.25 15.375H12.75C15 15.375 16.5 14.25 16.5 11.625V6.375C16.5 3.75 15 2.625 12.75 2.625ZM13.1025 7.1925L10.755 9.0675C10.26 9.465 9.63 9.66 9 9.66C8.37 9.66 7.7325 9.465 7.245 9.0675L4.8975 7.1925C4.6575 6.9975 4.62 6.6375 4.8075 6.3975C5.0025 6.1575 5.355 6.1125 5.595 6.3075L7.9425 8.1825C8.5125 8.64 9.48 8.64 10.05 8.1825L12.3975 6.3075C12.6375 6.1125 12.9975 6.15 13.185 6.3975C13.38 6.6375 13.3425 6.9975 13.1025 7.1925Z'
      fill={color}
    />
  </svg>
);

export default Email;
