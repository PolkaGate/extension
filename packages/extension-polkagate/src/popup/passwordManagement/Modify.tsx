// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Checkbox2, Password, TwoButtons } from '../../components';
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
  const [isChecked, setChecked] = useState<boolean>(false);
  const onCheckChange = useCallback(() => {
    isChecked && onPassChange('');
    setChecked(!isChecked);
  }, [isChecked, onPassChange]);

  return (
    <>
      {!error &&
        <Grid alignContent='center' container sx={{ height: '200px', pl: '40px' }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 500, pb: '5px' }}>
            {t<string>('You are about to modify your password. ')}
          </Typography>
          <Typography sx={{ fontSize: '13px' }}>
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
        <Passwords2
          disabled={isChecked}
          firstPassStyle={{ marginBlock: '8px' }}
          label={t<string>('New password')}
          onChange={onPassChange}
          onEnter={onSetPassword}
        />
        <Checkbox2
          checked={isChecked}
          label={t<string>('I want to enable passwordless login.')}
          labelStyle={{ fontSize: '14px' }}
          onChange={onCheckChange}
          style={{ p: '10px 0 0 5px' }}
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
