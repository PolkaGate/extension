// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React from 'react';

import { Motion } from '../../components';
import { VelvetBox } from '../../style';
import AccountIcon from './partials/AccountIcon';
import Appearance from './partials/Appearance';
import AutoLockTimer from './partials/AutoLockTimer';
import ChainsToViewAssets from './partials/ChainsToViewAssets';
import EnableCamera from './partials/EnableCamera';
import EnableTestNet from './partials/EnableTestNet';
import Language from './partials/Language';
import Notification from './partials/Notification';

function ExtensionSettings (): React.ReactElement {
  return (
    <Motion>
      <VelvetBox>
        <Stack alignItems='flex-start' direction='row' justifyContent='flex-start' sx={{ backgroundColor: 'background.paper', borderRadius: '14px', p: '0 0 30px 20px', width: '100%' }}>
          <Stack alignItems='flex-start' direction='column' justifyContent='flex-start' sx={{ width: '50%' }}>
            <Language />
            <Stack columnGap='60px' direction='row'>
              <EnableTestNet />
              <EnableCamera />
            </Stack>
            <AutoLockTimer />
          </Stack>
          <Stack alignItems='flex-start' direction='column' justifyContent='flex-start'>
            <AccountIcon />
            <Notification />
            <Appearance />
          </Stack>
        </Stack>
      </VelvetBox>
      <ChainsToViewAssets />
    </Motion>
  );
}

export default React.memo(ExtensionSettings);
