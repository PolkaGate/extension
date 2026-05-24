// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { styled } from '@mui/material';

const DetailGradientBox = styled('div')(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(6, 10, 29, 0) 100%)'
    : 'linear-gradient(180deg, rgba(255, 255, 255, 0.86) 0%, rgba(255, 255, 255, 0) 100%)',
  borderRadius: '24px',
  height: '150px',
  left: 6,
  position: 'absolute',
  right: 6,
  top: 8
}));

export default DetailGradientBox;
