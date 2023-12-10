// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, useTheme } from '@mui/material';
import React from 'react';

import { Password, TwoButtons, Warning } from '../../components';
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
  const theme = useTheme();

  return (
    <>
      <>
        {!error &&
          <Grid alignContent='center' container sx={{ height: '120px', top: '30px' }}>
            <Warning
              fontWeight={300}
              marginRight={18}
              theme={theme}
            >
              <Grid item>
                <b>{t<string>('You are about to modify your password. ')}</b>
                {t<string>('You can set a new password or leave the new password field and its repeat blank to remove the password.')}
              </Grid>
            </Warning>
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
    </>
  );
}

export default Confirmation;
