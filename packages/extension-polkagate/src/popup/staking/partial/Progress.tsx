// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, type SxProps, type Theme, Typography } from '@mui/material';
import React from 'react';
import { DotLoader } from 'react-spinners';

interface Props {
  text: string;
  style?: SxProps<Theme>;
  loaderSize?: number;
  withoutEllipsis?: boolean;
}

export default function Progress ({ loaderSize = 60, style, text, withoutEllipsis = false }: Props) {
  return (
    <Stack direction='column' sx={{ alignItems: 'center', gap: '40px', justifyContent: 'center', mt: '70px', width: '100%', ...style }}>
      <DotLoader color='#F9B85B' size={loaderSize} />
      <Typography color='text.primary' variant='B-3'>
        {text}{!withoutEllipsis && '...'}
      </Typography>
    </Stack>
  );
}
