// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React from 'react';
import { BeatLoader } from 'react-spinners';

interface Props {
  text: string;
  style?: SxProps<Theme>;
  loaderSize?: number;
  withoutEllipsis?: boolean;
}

export default function Progress ({ loaderSize = 15, style, text, withoutEllipsis = false }: Props) {
  const theme = useTheme();

  return (
    <Stack direction='column' sx={{ alignItems: 'center', gap: '40px', justifyContent: 'center', mt: '90px', width: '100%', ...style }}>
      <BeatLoader color={theme.palette.text.highlight} cssOverride={{ alignSelf: 'center' }} loading size={loaderSize} speedMultiplier={0.6} />
      <Typography color='text.primary' variant='B-3'>
        {text}{!withoutEllipsis && '...'}
      </Typography>
    </Stack>
  );
}
