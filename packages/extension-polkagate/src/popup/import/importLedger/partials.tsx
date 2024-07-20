// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { keyframes } from '@mui/material';

export const showAddressAnimation = keyframes`
0% {
  height: 0;
}
100% {
  height: 70px;
}
`;

export const hideAddressAnimation = keyframes`
0% {
  height: 70px;
}
100% {
  height: 0;
}
`;

export const AVAIL: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
