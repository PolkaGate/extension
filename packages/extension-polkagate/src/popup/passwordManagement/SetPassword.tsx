// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck


import { Grid } from '@mui/material';
import React, { useCallback } from 'react';

import { blake2AsHex } from '@polkadot/util-crypto';

import { TwoButtons } from '../../components';
import { setStorage } from '../../components/Loading';
import { useIsExtensionPopup, useTranslation } from '../../hooks';
import Passwords2 from '../newAccount/createAccountFullScreen/components/Passwords2';
import { STEPS } from './constants';
import PasswordSettingAlert from './PasswordSettingAlert';

interface Props {
  onBackClick: () => void;
  onPassChange: (pass: string | null) => void
  isPasswordError: boolean;
  newPassword: string;
  setStep: React.Dispatch<React.SetStateAction<number | undefined>>
}

function SetPassword({ isPasswordError, newPassword, onBackClick, onPassChange, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isExtensionMode = useIsExtensionPopup();

  const onSetPassword = useCallback(async () => {
    if (newPassword) {
      const hashedPassword = blake2AsHex(newPassword, 256);
      const isConfirmed = await setStorage('loginInfo', { hashedPassword, lastLoginTime: Date.now(), status: 'set' });

      setStep(isConfirmed ? STEPS.NEW_PASSWORD_SET : STEPS.ERROR);
    }
  }, [newPassword, setStep]);

  return (
    <>
      {!isPasswordError &&
        <Grid container sx={{ height: '135px' }}>
          <PasswordSettingAlert />
        </Grid>
      }
      <Grid container justifyContent='center' sx={{ display: 'block', mb: '30px', pt: '170px', px: isExtensionMode ? '8%' : 0 }}>
        <Passwords2
          firstPassStyle={{ marginBlock: '8px' }}
          isFocussed
          label={t<string>('Password')}
          onChange={onPassChange}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onEnter={onSetPassword}
        />
      </Grid>
      <Grid container justifyContent='center' sx={{ bottom: isExtensionMode ? '15px' : '25px', height: '40px', ml: isExtensionMode ? '8%' : 0, position: 'absolute', width: isExtensionMode ? '84%' : '87%' }}>
        <TwoButtons
          disabled={!newPassword}
          ml='0px'
          mt='0px'
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onPrimaryClick={onSetPassword}
          onSecondaryClick={onBackClick}
          primaryBtnText={t<string>('Set')}
          secondaryBtnText={t<string>('Cancel')}
          width='100%'
        />
      </Grid>
    </>
  );
}

export default SetPassword;
