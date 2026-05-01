// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack } from '@mui/material';
import React from 'react';

import { useIsDark } from '@polkadot/extension-polkagate/src/hooks';

import { logoBlackBirdTransparent, logoTransparent, polkagateVector, polkagateVectorBlack } from '../../../assets/logos';

function LogoWithText({ style = {} }: { style: React.CSSProperties }): React.ReactElement {
  const isDark = useIsDark();

  return (
    <Stack alignItems='center' direction='row' sx={{ ...style }}>
      <Box component='img' src={(isDark ? logoTransparent : logoBlackBirdTransparent) as string} sx={{ width: '38px' }} />
      <Box component='img' src={(isDark ? polkagateVector : polkagateVectorBlack) as string} sx={{ width: '84px' }} />
    </Stack>
  );
}

export default React.memo(LogoWithText);
