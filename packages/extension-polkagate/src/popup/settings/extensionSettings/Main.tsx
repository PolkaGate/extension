// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React from 'react';

import EnableTestNet from '@polkadot/extension-polkagate/src/fullscreen/settings/partials/EnableTestNet';

import AutoLockTimer from './partials/AutoLockTimer';
import EnableCamera from './partials/EnableCamera';
import Language from './partials/Language';

function Main (): React.ReactElement {
  return (
    <Grid alignItems='flex-start' container item justifyContent='flex-start' sx={{ bgcolor: 'background.paper', borderRadius: '14px', display: 'block', p: '10px' }}>
      <EnableTestNet />
      <EnableCamera />
      <AutoLockTimer />
      <Language />
    </Grid>
  );
}

export default React.memo(Main);
