// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React, { useCallback } from 'react';

import { ButtonWithCancel, InputWithLabel, Label, NewAddress } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import Passwords2 from '../../createAccountFullScreen/components/Passwords2';

interface Props {
  address: string;
  derivedAccountName: string | null;
  onNameChange: ((value: string) => void) | undefined;
  onPasswordChange: (password: string | null) => void;
  password: string | null;
  onCreate: () => void;
  onBackClick: () => void;
  isBusy: boolean;
}

export default function CreateNewDerivedAccount({ address, derivedAccountName, isBusy, onBackClick, onCreate, onNameChange, onPasswordChange, password }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const nullF = useCallback(() => null, []);

  return (
    <>
      <Label
        label={t('New derived account')}
        style={{ margin: 'auto', marginBottom: '15px' }}
      >
        <NewAddress
          address={address}
          name={derivedAccountName}
          showCopy
          style={{ m: 0, width: '100%' }}
        />
      </Label>
      <InputWithLabel
        isError={derivedAccountName === null || derivedAccountName?.length === 0}
        isFocused
        label={t('Choose a name for this account')}
        onChange={onNameChange}
        value={derivedAccountName ?? ''}
      />
      <Passwords2
        firstPassStyle={{ marginBlock: '10px' }}
        label={t('Password for this account (more than 5 characters)')}
        onChange={onPasswordChange}
        onEnter={derivedAccountName && password ? onCreate : nullF}
      />
      <Grid container item sx={{ '> div': { ml: 'auto', width: '87.5%' }, bottom: 0, height: '36px', position: 'absolute' }}>
        <ButtonWithCancel
          _isBusy={isBusy}
          _onClick={onCreate}
          _onClickCancel={onBackClick}
          cancelText={t('Back')}
          disabled={!password || !derivedAccountName}
          text={t('Create')}
        />
      </Grid>
    </>
  );
}
