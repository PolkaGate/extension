// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, styled } from '@mui/material';

const GradientBorder = styled(Box)(({ style }) => ({
  background: 'linear-gradient(178deg, transparent 22.53%, #ECB4FF 47.68%, #ECB4FF 62.78%, transparent 72.53%)',
  height: '2px',
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
  width: '100%',
  zIndex: 2,
  ...style
}));

export default GradientBorder;
