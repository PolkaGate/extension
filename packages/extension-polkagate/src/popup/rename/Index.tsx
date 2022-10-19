// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';
import { useParams } from 'react-router';

import { ActionContext, PButton } from '../../components';
import Identity from '../../components/goingToBeIdentity';
import { useMetadata, useTranslation } from '../../hooks';
import { editAccount } from '../../messaging';
import { HeaderBrand, Name } from '../../partials';
import { RenameAcc } from '../../util/types';

interface Props {
  className?: string;
}

export default function Rename({ className }: Props): React.ReactElement<Props> {
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
        text={t<string>('Rename account')}
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
      <PButton
        _onClick={_changeName}
        disabled={!newName}
        text={t<string>('Rename')}
      />
    </>
  );
}
