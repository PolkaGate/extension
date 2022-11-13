// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography, useTheme } from '@mui/material';
import React from 'react';

import { Step } from '../util/types';

function Steps({ current, total }: Step) {
  const theme = useTheme();

  return (
    <Typography
      color='text.primary'
      fontFamily='inherit'
      fontSize='20px'
      fontWeight={400}
      letterSpacing='-0.015em'
      p='5px'
    >
      <span>(</span>
      <span style={{ color: theme.palette.secondary.light }}>{current}</span>
      <span>{'/' + total.toString() + ')'}</span>
    </Typography>
  )
}

export default React.memo(Steps);
