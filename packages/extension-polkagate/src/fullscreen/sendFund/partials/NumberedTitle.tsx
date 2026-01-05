// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

import { TwoToneText } from '../../../components';

interface Props {
  number: number;
  title: string;
  textPartInColor?: string | undefined;
}

export default function NumberedTitle ({ number, textPartInColor, title }: Props): React.ReactElement {
  const theme = useTheme();

  return (
    <Stack columnGap='5px' direction='row'>
      <Box sx={{ alignItems: 'center', background: '#6743944D', border: '1px solid #2D1E4A', borderRadius: '50%', display: 'flex', height: '20px', justifyContent: 'center', width: '20px' }}>
        <Typography color='#AA83DC' sx={{ textAlign: 'center' }} variant='B-3'>
          {number}
        </Typography>
      </Box>
      <Typography color='text.primary' sx={{ textAlign: 'center' }} variant='B-1'>
        <TwoToneText
          color={theme.palette.primary.main}
          text={title}
          textPartInColor={textPartInColor}
        />
      </Typography>
    </Stack>
  );
}
