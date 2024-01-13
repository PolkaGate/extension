// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React, { useCallback } from 'react';

import { blake2AsHex } from '@polkadot/util-crypto';

import { TwoButtons } from '../../components';
import { setStorage } from '../../components/Loading';
import { useTranslation } from '../../hooks';
import Passwords2 from '../createAccountFullScreen/components/Passwords2';
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
        <Grid container sx={{ height: '120px', top: '30px' }}>
          <PasswordSettingAlert />
        </Grid>
      }
      <Grid container justifyContent='center' sx={{ display: 'block', pt: '180px', px: '10%' }}>
        <Passwords2
          firstPassStyle={{ marginBlock: '8px' }}
          isFocussed
          label={t<string>('Password')}
          onChange={onPassChange}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onEnter={onSetPassword}
        />
      </Grid>
      <Grid container justifyContent='center' sx={{ px: '2%' }}>
        <TwoButtons
          disabled={!newPassword}
          mt='20px'
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onPrimaryClick={onSetPassword}
          onSecondaryClick={onBackClick}
          primaryBtnText={t<string>('Set')}
          secondaryBtnText={t<string>('Cancel')}
        />
      </Grid>
    </>
  );
}

export default SetPassword;
