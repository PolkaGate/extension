// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Step } from '../util/types';

import { Typography, useTheme } from '@mui/material';
import React from 'react';

function Steps({ current, style = { fontSize: '18px', fontWeight: 400, lineHeight: '35px' }, total }: Step) {
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
