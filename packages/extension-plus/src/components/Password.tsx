// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

import { CheckRounded, Clear } from '@mui/icons-material';
import { Grid, IconButton, InputAdornment, TextField } from '@mui/material';
import React, { useCallback } from 'react';

import useTranslation from '../../../extension-ui/src/hooks/useTranslation';
import { PASS_MAP } from '../util/constants';

interface Props {
  password: string;
  passwordStatus: number;
  setPasswordStatus: React.Dispatch<React.SetStateAction<number>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  handleIt: () => Promise<void>;
  isDisabled?: boolean;
  autofocus?: boolean;
  helper?: string;
  showHelper?: boolean;
}

export default function Password({ autofocus = false, handleIt, helper = 'Please enter the account password', isDisabled = false, password, passwordStatus, setPassword, setPasswordStatus, showHelper = true }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const handleClearPassword = useCallback((): void => {
    setPasswordStatus(PASS_MAP.EMPTY);
    setPassword('');
  }, [setPassword, setPasswordStatus]);

  const handleSavePassword = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    setPassword(event.target.value);

    if (event.target.value === '') { handleClearPassword(); }
  }, [handleClearPassword, setPassword]);

  return (
    <Grid item sx={{ m: 1 }} xs={12}>
      <TextField
        InputLabelProps={{
          style: { fontSize: 14 }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <IconButton
                onClick={handleClearPassword}
              >
                {password !== '' && passwordStatus !== PASS_MAP.CORRECT ? <Clear /> : ''}
              </IconButton>
            </InputAdornment>
          ),
          startAdornment: (
            <InputAdornment position='start'>
              {passwordStatus === PASS_MAP.CORRECT ? <CheckRounded color='success' /> : ''}
            </InputAdornment>
          ),
          style: { fontSize: 13 }
        }}
        autoFocus={autofocus}
        color='warning'
        disabled={isDisabled}
        error={passwordStatus === PASS_MAP.INCORRECT}
        fullWidth
        helperText={showHelper && passwordStatus === PASS_MAP.INCORRECT ? t('Password is not correct') : t(helper)}
        label={t('Password')}
        onChange={handleSavePassword}
        onKeyPress={(event) => {
          if (event.key === 'Enter' && !isDisabled) { handleIt(); }
        }}
        size='medium'
        type='password'
        value={password}
        variant='outlined'
      />
    </Grid>
  );
}
