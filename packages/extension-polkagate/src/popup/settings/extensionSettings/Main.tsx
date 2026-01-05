// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React from 'react';

import AutoLockTimerAdjustment from '@polkadot/extension-polkagate/src/fullscreen/settings/partials/AutoLockTimerAdjustment';
import EnableTestNet from '@polkadot/extension-polkagate/src/fullscreen/settings/partials/EnableTestNet';

import EnableCamera from './partials/EnableCamera';
import Language from './partials/Language';

function Main (): React.ReactElement {
  return (
    <Grid alignItems='flex-start' container item justifyContent='flex-start' sx={{ bgcolor: 'background.paper', borderRadius: '14px', display: 'block', p: '10px' }}>
      <EnableTestNet />
      <EnableCamera />
       <AutoLockTimerAdjustment />
      <Language />
    </Grid>
  );
}

export default React.memo(Main);
