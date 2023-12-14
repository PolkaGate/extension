// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React from 'react';

import { Password, TwoButtons } from '../../components';
import { useTranslation } from '../../hooks';
import Passwords2 from '../createAccountFullScreen/components/Passwords2';

interface Props {
  onBackClick: () => void;
  onPassChange: (pass: string | null) => void
  error: string | undefined;
  onSetPassword: () => Promise<void>
  currentPassword: string
  onCurrentPasswordChange: (pass: string | null) => void;
}

function Confirmation({ currentPassword, error, onBackClick, onCurrentPasswordChange, onPassChange, onSetPassword }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <>
      {!error &&
        <Grid alignContent='center' container sx={{ height: '200px', pl: '40px' }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 400, pb: '10px' }}>
            {t<string>('You are about to modify your password. ')}
          </Typography>
          <Typography sx={{ fontSize: '13px' }}>
            <b> {t<string>('To Change Password:')}</b>{' '}
            {t<string>('Enter current password. Add a new password. Click Set.')}<br />
          </Typography>
          <Typography sx={{ fontSize: '13px', py: '7px' }}>
            <b>{t<string>('OR')}</b>
          </Typography>
          <Typography sx={{ fontSize: '13px' }}>
            <b> {t<string>('To Remove Password:')}</b>{' '}
            {t<string>('Enter current password. Leave new password fields empty. Click Set.')}
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
        <Passwords2
          firstPassStyle={{ marginBlock: '8px' }}
          label={t<string>('New password')}
          onChange={onPassChange}
          onEnter={onSetPassword}
        />
      </Grid>
      <TwoButtons
        disabled={!currentPassword}
        onPrimaryClick={onSetPassword}
        onSecondaryClick={onBackClick}
        primaryBtnText={t<string>('Set')}
        secondaryBtnText={t<string>('Cancel')}
      />
    </>
  );
}

export default Confirmation;
