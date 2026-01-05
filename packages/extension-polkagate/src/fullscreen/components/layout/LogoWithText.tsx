// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack } from '@mui/material';
import React from 'react';

import { logoTransparent, polkagateVector } from '../../../assets/logos';

function LogoWithText ({ style = {} }: {style: React.CSSProperties}): React.ReactElement {
  return (
    <Stack alignItems='center' direction='row' sx={{ ...style }}>
      <Box component='img' src={(logoTransparent) as string} sx={{ width: '38px' }} />
      <Box component='img' src={(polkagateVector) as string} sx={{ width: '84px' }} />
    </Stack>
  );
}

export default React.memo(LogoWithText);
