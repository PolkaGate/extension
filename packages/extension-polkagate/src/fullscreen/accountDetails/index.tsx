// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React, { } from 'react';

import HomeLayout from '../components/layout';
import LeftColumn from './LeftColumn';
import RightColumn from './rightColumn';

export default function AccountDetails(): React.ReactElement {
  return (
    <HomeLayout>
      <Stack columnGap='8px' direction='row' sx={{ minHeight: '685px' }}>
        <LeftColumn />
        <RightColumn />
      </Stack>
    </HomeLayout>
  );
}
