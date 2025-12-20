// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CircularProgressProps } from '@mui/material/CircularProgress';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import * as React from 'react';

export default function CircularProgressWithLabel (
  props: CircularProgressProps & { value: number, style?: React.CSSProperties }
) {
  return (
    <Box sx={{ display: 'inline-flex', position: 'relative', ...props.style }}>
      <CircularProgress {...props} />
      <Box
        sx={{
          alignItems: 'center',
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0
        }}
      >
        <Typography
          component='div'
          sx={{ color: 'text.secondary' }}
          variant='caption'
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}
