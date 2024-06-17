// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import { Typography, useTheme } from '@mui/material';
import React from 'react';

import type { Step } from '../util/types';

function Steps({ current, style = { fontSize: '20px', fontWeight: 400, lineHeight: '35px' }, total }: Step) {
  const theme = useTheme();

  return (
    <Typography color='text.primary' fontFamily='inherit' sx={{ ...style }} p='0 5px'>
      <span>
        (
      </span>
      <span style={{ color: theme.palette.secondary.light }}>
        {current}
      </span>
      <span>
        {'/' + total.toString() + ')'}
      </span>
    </Typography>
  );
}

export default React.memo(Steps);
