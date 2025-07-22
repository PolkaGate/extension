// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React, { memo } from 'react';

import PositionsToolbar from './PositionsToolbar';

function StakingPositions () {
  return (
    <Stack direction='column' sx={{ width: '100%' }}>
      <PositionsToolbar />
    </Stack>
  );
}

export default memo(StakingPositions);
