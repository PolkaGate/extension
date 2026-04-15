// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, CircularProgress } from '@mui/material';
import React from 'react';

import { logoWhiteTransparent } from '../../assets/logos';
import { useIsDark } from '../../hooks/index';

function PolkaGateTransparentLogo(): React.ReactElement {
  const isDark = useIsDark();

  return (
    <Box
      sx={{
        height: '36px',
        position: 'relative',
        width: '36px'
      }}
    >
      <CircularProgress
        color='primary'
        size={36.5}
        sx={{
          left: 0,
          position: 'absolute',
          top: 0
        }}
        thickness={4}
      />
      <Box
        component='img'
        src={logoWhiteTransparent as string}
        sx={{
          bgcolor: isDark ? '#292247' : '#CFD5F0',
          borderRadius: '999px',
          filter: isDark ? 'brightness(0.4)' : 'brightness(0.9)',
          height: '36px',
          left: 0,
          p: '4px',
          position: 'absolute',
          top: 0,
          width: '36px'
        }}
      />
    </Box>
  );
}

export default PolkaGateTransparentLogo;
