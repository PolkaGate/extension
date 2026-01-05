// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mui/material';
import React from 'react';

import { loader } from '../assets/gif';

interface Props {
  style?: React.CSSProperties;
}

function LoaderGif ({ style }: Props) {
  return (
    <Box
      component='img'
      src={loader as string}
      sx={{
        '@keyframes spin': {
          '0%': {
            transform: 'rotate(0deg)'
          },
          '100%': {
            transform: 'rotate(360deg)'
          }
        },
        animation: 'spin 1.5s linear infinite',
        height: '42px',
        zIndex: 2,
        ...style
      }}
    />
  );
}

export default LoaderGif;
