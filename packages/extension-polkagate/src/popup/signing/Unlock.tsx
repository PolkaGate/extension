// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React, { useCallback } from 'react';

import { InputWithLabel } from '../../components';
import useTranslation from '../../hooks/useTranslation';

interface Props {
  error?: string | null;
  isBusy: boolean;
  onSign: () => void;
  password: string;
  setError: (error: string | null) => void;
  setPassword: (password: string) => void;
}

function Unlock({ error, isBusy, onSign, password, setError, setPassword }: Props): React.ReactElement<Props> {
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
      <InputWithLabel
        disabled={isBusy}
        isError={!!error}
        isFocused
        label={t<string>('Password for this account')}
        onChange={_onChangePassword}
        onEnter={onSign}
        type='password'
        value={password}
        withoutMargin={true}
      />
    </Grid>
  );
}

export default React.memo(Unlock);
