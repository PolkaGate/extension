// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

import { TwoToneText } from '../../../../components';

interface Props {
  num: number;
  text: string;
  textPartInColor: string;
}

export default function Step({ num, text, textPartInColor }: Props): React.ReactElement {
  const theme = useTheme();

  return (
    <Stack direction='row' sx={{ mb: '10px' }}>
      <Typography color='#EAEBF1' sx={{ bgcolor: '#674394', borderRadius: '50%', display: 'inline-block', height: '18px', width: '18px', mr: '5px' }} variant='B-1'>
        {num}
      </Typography>
      <Typography color='#EAEBF1' sx={{ textAlign: 'left', width: 'fit-content' }} variant='B-1'>
        <TwoToneText
          backgroundColor='#67439459'
          color={theme.palette.primary.main}
          text={text}
          textPartInColor={textPartInColor}
        />
      </Typography>

    </Stack>
  );
}