// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

import type { ThemeProps } from '../../../extension-ui/src/types';

import Box from '@mui/material/Box';
import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import styled from 'styled-components';

function CircularProgressWithValue(
  props: CircularProgressProps & { value: number, Kolor?: string }
) {
  return (
    <Box sx={{ position: 'relative', border: 'none' }}>
      <CircularProgress
        size={100}
        sx={{ border: 'none', color: props.Kolor ?? 'black' }}
        variant='determinate'
        {...props}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography
          color='text.secondary'
          component='div'
          variant='caption'
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

export default styled(CircularProgressWithValue)(({ theme }: ThemeProps) => `
  background: ${theme.accountBackground};
  border: 1px solid ${theme.boxBorderColor};
  box-sizing: border-box;
  position: relative;
`);
