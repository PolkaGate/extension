// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack } from '@mui/material';
import React from 'react';

import { HomeAccountDropDown } from '../../../components';
import CurrencySelection from './CurrencySelection';
import HideNumbers from './HideNumbers';
import Notifications from './Notifications';

function MyDivider (): React.ReactElement {
  return (
    <Box
      sx={{
        background: 'linear-gradient(180deg, rgba(210, 185, 241, 0.07) 0%, rgba(210, 185, 241, 0.35) 50.06%, rgba(210, 185, 241, 0.07) 100%)',
        height: '24px',
        mx: '4px',
        width: '1px'
      }}
    />
  );
}

function TopRightActions (): React.ReactElement {
  return (
    <Stack alignItems='center' columnGap='7px' direction='row' sx={{ position: 'absolute', right: 0, top: '5px' }}>
      <HideNumbers />
      <MyDivider />
      <CurrencySelection />
      <MyDivider />
      <Notifications />
      <MyDivider />
      <HomeAccountDropDown
        style={{
          height: '32px',
          width: '48px'
        }}
      />
    </Stack>
  );
}

export default React.memo(TopRightActions);
