// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Checkbox2, Password, TwoButtons } from '../../components';
import { setStorage } from '../../components/Loading';
import { useTranslation } from '../../hooks';
import Passwords2 from '../createAccountFullScreen/components/Passwords2';
import { STEPS } from './constants';

interface Props {
  onBackClick: () => void;
  onPassChange: (pass: string | null) => void
  error: string | undefined;
  onSetPassword: () => Promise<void>
  currentPassword: string
  onCurrentPasswordChange: (pass: string | null) => void;
  setStep: React.Dispatch<React.SetStateAction<number | undefined>>
}

function Modify({ currentPassword, error, onBackClick, onCurrentPasswordChange, onPassChange, onSetPassword, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [isRemovePasswordChecked, setChecked] = useState<boolean>(false);
  const onCheckChange = useCallback(() => {
    setChecked(!isRemovePasswordChecked);
  }, [isRemovePasswordChecked]);

  const onRemovePassword = useCallback(async () => {
    const isConfirmed = await setStorage('loginInfo', { status: 'no' });

    setStep(isConfirmed ? STEPS.PASSWORD_REMOVED : STEPS.ERROR);
  }, [setStep]);

  const onSet = useCallback(() => {
    if (isRemovePasswordChecked) {
      onRemovePassword().catch(console.error);
    } else {
      onSetPassword().catch(console.error);
    }
  }, [isRemovePasswordChecked, onRemovePassword, onSetPassword]);

  return (
    <>
      {!error &&
        <Grid alignContent='center' container sx={{ height: '200px', pl: '40px' }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 500, pb: '5px' }}>
            {t<string>('You are about to modify your password. ')}
          </Typography>
          <Typography sx={{ fontSize: '14px' }}>
            {t<string>('You can set a new password or even remove your password.')}<br />
          </Typography>
        </Grid>
      }
      <Grid container sx={{ bottom: '85px', display: 'block', position: 'absolute', px: '10%' }}>
        <Password
          isFocused
          label={t('Current password')}
          onChange={onCurrentPasswordChange}
          style={{ marginBottom: '25px' }}
        />
        <Grid item sx={{ opacity: isRemovePasswordChecked ? 0.5 : 1 }}>
          <Passwords2
            disabled={isRemovePasswordChecked}
            firstPassStyle={{ marginBlock: '8px' }}
            label={t<string>('New password')}
            onChange={onPassChange}
            onEnter={onSetPassword}
          />
        </Grid>
        <Checkbox2
          checked={isRemovePasswordChecked}
          label={t<string>('I want to enable passwordless login.')}
          labelStyle={{ fontSize: '14px' }}
          onChange={onCheckChange}
          style={{ p: '10px 0 0 5px' }}
        />
      </Grid>
      <TwoButtons
        disabled={!currentPassword}
        onPrimaryClick={onSet}
        onSecondaryClick={onBackClick}
        primaryBtnText={t<string>('Set')}
        secondaryBtnText={t<string>('Cancel')}
      />
    </>
  );
}

export default Modify;
