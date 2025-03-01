// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { ButtonWithCancel, NewAddress } from '../../components';
import { useAccountName, useTranslation } from '../../hooks';
import { editAccount } from '../../messaging';
import { Name } from '../../partials';
import { DraggableModal } from '../governance/components/DraggableModal';
import SimpleModalTitle from './SimpleModalTitle';

interface Props {
  address: string;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export default function RenameModal({ address, setDisplayPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const accountName = useAccountName(address);

  const [newName, setNewName] = useState<string | undefined>();

  const backToAccount = useCallback(() => setDisplayPopup(undefined), [setDisplayPopup]);
  const changedName = useMemo(() => {
    if (newName && newName.length > 2) {
      return newName;
    } else {
      return accountName;
    }
  }, [accountName, newName]);

  const editName = useCallback((newName: string | null) => {
    setNewName(newName ?? '');
  }, []);

  const _changeName = useCallback(() => {
    newName &&
      editAccount(address, newName)
        .catch(console.error);

    backToAccount();
  }, [address, backToAccount, newName]);

  return (
    <DraggableModal onClose={backToAccount} open>
      <>
        <SimpleModalTitle
          icon='vaadin:edit'
          onClose={backToAccount}
          title={t('Rename Account')}
        />
        <NewAddress
          address={address}
          name={changedName}
          style={{ my: '25px' }}
        />
        <Name
          isFocused
          label={t<string>('Choose a new name for your account.')}
          onChange={editName}
          onEnter={_changeName}
          style={{ width: '100%' }}
        />
        <Grid container item sx={{ '> div': { ml: 'auto', width: '87.5%' }, bottom: 0, height: '36px', position: 'absolute' }}>
          <ButtonWithCancel
            _onClick={_changeName}
            _onClickCancel={backToAccount}
            disabled={!newName}
            text={t<string>('Rename')}
          />
        </Grid>
      </>
    </DraggableModal>
  );
}
