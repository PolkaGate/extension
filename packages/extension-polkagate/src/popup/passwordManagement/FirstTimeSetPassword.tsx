// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React, { useCallback } from 'react';

import { TwoButtons } from '../../components';
import { setStorage } from '../../components/Loading';
import { useExtensionLockContext } from '../../context/ExtensionLockContext';
import { useTranslation } from '../../hooks';
import Passwords2 from '../createAccountFullScreen/components/Passwords2';
import { STEPS } from './constants';

interface Props {
  onPassChange: (pass: string | null) => void
  setStep: React.Dispatch<React.SetStateAction<number | undefined>>;
  hashedPassword: string;
}

function FirstTimeSetPassword ({ hashedPassword, onPassChange, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { setExtensionLock } = useExtensionLockContext();

  const onSetPassword = useCallback(async () => {
    await setStorage('loginInfo', { hashedPassword, lastLoginTime: Date.now(), status: 'justSet' });
    setExtensionLock(true);
    setStep(STEPS.SHOW_LOGIN);
  }, [hashedPassword, setExtensionLock, setStep]);

  const onCancel = useCallback(() => {
    setStep(STEPS.ASK_TO_SET_PASSWORD);
  }, [setStep]);

  return (
    <>
      <Grid container justifyContent='center' sx={{ display: 'block', px: '10%' }}>
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
          disabled={!hashedPassword}
          mt='20px'
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onPrimaryClick={onSetPassword}
          onSecondaryClick={onCancel}
          primaryBtnText={t<string>('Set')}
          secondaryBtnText={t<string>('Cancel')}
        />
      </Grid>
    </>
  );
}

export default FirstTimeSetPassword;
