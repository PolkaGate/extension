// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React, { useCallback } from 'react';

import { Password } from '../../components';
import useTranslation from '../../hooks/useTranslation';

interface Props {
  error?: string | null;
  isBusy: boolean;
  onSign: () => void;
  password: string;
  setError: (error: string | null) => void;
  setPassword: (password: string) => void;
}

function Unlock ({ error, isBusy, onSign, password, setError, setPassword }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const _onChangePassword = useCallback(
    (password: string): void => {
      setPassword(password);
      setError(null);
    },
    [setError, setPassword]
  );

  return (
    <Grid container direction='column' m='auto' width='92%'>
      <Password
        defaultValue={password}
        disabled={isBusy}
        isError={!!error}
        isFocused
        label={t<string>('Password for this account')}
        onChange={_onChangePassword}
        onEnter={onSign}
      />
    </Grid>
  );
}

export default React.memo(Unlock);
