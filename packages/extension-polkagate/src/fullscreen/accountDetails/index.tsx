// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React, { } from 'react';

import { useFullscreen } from '@polkadot/extension-polkagate/src/hooks';

import HomeLayout from '../components/layout';
import LeftColumn from './LeftColumn';
import RightColumn from './rightColumn';

export default function AccountDetails (): React.ReactElement {
  useFullscreen(); // just to put possible alerts to top right of the screen

  return (
    <HomeLayout>
      <Stack columnGap='8px' direction='row' sx={{ height: '685px' }}>
        <LeftColumn />
        <RightColumn />
      </Stack>
    </HomeLayout>
  );
}
