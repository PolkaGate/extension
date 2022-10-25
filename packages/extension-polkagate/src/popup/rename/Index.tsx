// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';
import { useParams } from 'react-router';

import { ActionContext, ButtonWithCancel } from '../../components';
import Identity from '../../components/goingToBeIdentity';
import { useTranslation } from '../../hooks';
import { editAccount } from '../../messaging';
import { HeaderBrand, Name } from '../../partials';

export default function Rename(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const { address } = useParams<{ address: string }>();
  const [newName, setNewName] = useState<string | undefined>();

  const _onBackClick = useCallback(() => {
    onAction('/');
  }, [onAction]);

  const editName = useCallback((newName: string | null) => {
    setNewName(newName ?? '');
  }, []);

  const _changeName = useCallback(() => {
    newName &&
      editAccount(address, newName)
        .catch(console.error);
    onAction('/');
  }, [address, newName, onAction]);

  return (
    <>
      <HeaderBrand
        onBackClick={_onBackClick}
        showBackArrow
        text={t<string>('Rename Account')}
      />
      <Identity
        address={address}
        name={newName}
        style={{ padding: '20px' }}
      />
      <Typography
        fontSize='14px'
        fontWeight={300}
        m='auto'
        width='fit-content'
      >
        {t<string>('Choose a new name for your account.')}
      </Typography>
      <Name
        label={t<string>('Name')}
        onChange={editName}
      />
      <ButtonWithCancel
        _onClick={_changeName}
        _onClickCancel={_onBackClick}
        disabled={!newName}
        text={t<string>('Rename')}
      />
    </>
  );
}
