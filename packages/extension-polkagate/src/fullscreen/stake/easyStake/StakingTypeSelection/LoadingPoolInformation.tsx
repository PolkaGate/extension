// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Skeleton, Stack } from '@mui/material';
import React from 'react';

export const LoadingPoolInformation = () => (
  <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#1B133C', borderRadius: '10px', display: 'flex', flexDirection: 'row', p: '2px', pl: '16px' }}>
    <Skeleton animation='wave' height='24px' sx={{ borderRadius: '999px', transform: 'none', width: '24px' }} variant='text' />
    <Stack direction='column' sx={{ gap: '4px', ml: '12px', width: 'fit-content' }}>
      <Skeleton animation='wave' height='20px' sx={{ borderRadius: '6px', transform: 'none', width: '190px' }} variant='text' />
      <Skeleton animation='wave' height='20px' sx={{ borderRadius: '6px', transform: 'none', width: '90px' }} variant='text' />
    </Stack>
    <Skeleton animation='wave' height='55px' sx={{ borderRadius: '6px', ml: 'auto', transform: 'none', width: '35px' }} variant='text' />
  </Container>
);
