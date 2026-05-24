// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, useTheme } from '@mui/material';
import React from 'react';

export default function Line({ height }: { height: number }): React.ReactElement {
  const theme = useTheme();
  const lineColor = theme.palette.mode === 'dark' ? '#2D1E4A' : '#DDE3F4';

  return (
    <Box
      sx={{
        borderBottom: `1px solid ${lineColor}`,
        borderLeft: `1px solid ${lineColor}`,
        borderRadius: '0',
        height: `${height}px`,
        left: '12px',
        position: 'absolute',
        top: 0,
        width: '0'
      }}
    />
  );
}
