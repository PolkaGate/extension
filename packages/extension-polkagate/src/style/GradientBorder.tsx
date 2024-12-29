// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, styled } from '@mui/material';

const GradientBorder = styled(Box)(() => ({
  background: `linear-gradient(
      262.56deg,
      rgba(236, 180, 255, 0) 22.53%,
      #ECB4FF 47.68%,
      #ECB4FF 62.78%,
      rgba(236, 180, 255, 0) 72.53%
    )`,
  height: '2px',
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
  width: '100%',
  zIndex: 2
}));

export default GradientBorder;
