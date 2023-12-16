// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React from 'react';

import { TwoButtons } from '../../components';
import { useTranslation } from '../../hooks';
import Passwords2 from '../createAccountFullScreen/components/Passwords2';
import PasswordSettingAlert from './PasswordSettingAlert';

interface Props {
  onBackClick: () => void;
  onPassChange: (pass: string | null) => void
  error: string | undefined;
  onSetPassword: () => Promise<void>
}

function SetPassword ({ error, onBackClick, onPassChange, onSetPassword }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <>
      {!error &&
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
