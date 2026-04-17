// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React from 'react';

import { Motion } from '../../components';
import BiometricUnlockSetting from '../../partials/BiometricUnlockSetting';
import { VelvetBox } from '../../style';
import AccountIcon from './partials/AccountIcon';
import AiTransactionInfo from './partials/AiTransactionInfo';
import Appearance from './partials/Appearance';
import AutoLockTimerAdjustment from './partials/AutoLockTimerAdjustment';
import DappRequests from './partials/DappRequests';
import DiagnosticsReports from './partials/DiagnosticsReports';
import EnableCamera from './partials/EnableCamera';
import EnableTestNet from './partials/EnableTestNet';
import Language from './partials/Language';
import Password from './partials/Password';
import SubscanApi from './partials/SubscanApi';

function ExtensionSettings(): React.ReactElement {
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
            <BiometricUnlockSetting titleMargin='45px 0 15px' />
            <AiTransactionInfo />
            <Password />
            <DiagnosticsReports />
          </Stack>
          <Stack alignItems='flex-start' direction='column' justifyContent='flex-start'>
            <AccountIcon />
            <DappRequests />
            <Appearance />
            <AutoLockTimerAdjustment />
            <SubscanApi />
          </Stack>
        </Stack>
      </VelvetBox>
    </Motion>
  );
}

export default React.memo(ExtensionSettings);
