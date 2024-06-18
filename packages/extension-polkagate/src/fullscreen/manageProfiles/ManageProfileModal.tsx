// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */


import { Grid } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { ButtonWithCancel, NewAddress } from '../../components';
import { useTranslation } from 'react-i18next';
import { DraggableModal } from '../governance/components/DraggableModal';
import { useInfo } from '../../hooks';
import { SimpleModalTitle } from './SimpleModalTitle';
import { Name } from '../../partials';
import { updateMeta } from '../../messaging';

interface Props {
  address: string;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export default function ManageProfileModal({ address, setDisplayPopup }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const { account } = useInfo(address);

  const [isBusy, setIsBusy] = useState(false);
  const [newName, setNewName] = useState<string | undefined>();

  const editName = useCallback((newName: string | null) => {
    setNewName(newName ?? '');
  }, []);
  console.log('account', account)


  const addToNewProfile = useCallback(() => {
    if (!newName) {
      return;
    }

    setIsBusy(true);
    const metaData = JSON.stringify({ profile: newName });

    updateMeta(String(address), metaData)
      .then(() => {
        setIsBusy(false);
        onClose();
      }).catch(console.error);
  }, [address, newName]);

  const onClose = useCallback(() => setDisplayPopup(undefined), [setDisplayPopup]);

  return (
    <DraggableModal onClose={onClose} open>
      <>
        <SimpleModalTitle
          text={t('Manage Profiles')}
          onClose={onClose}
          icon={'vaadin:archives'}
        />
        <NewAddress
          address={account?.address}
          style={{ my: '25px' }}
        />
        <Name
          isFocused
          label={t('Choose a name for your new profile.')}
          onChange={editName}
          onEnter={addToNewProfile}
          style={{ width: '100%' }}
        />
        <Grid container item sx={{ '> div': { ml: 'auto', width: '87.5%' }, bottom: 0, height: '36px', position: 'absolute' }}>
          <ButtonWithCancel
            _isBusy={isBusy}
            _onClick={addToNewProfile}
            _onClickCancel={onClose}
            // disabled={!checkConfirmed}
            text={t('Create')}
          />
        </Grid>
      </>
    </DraggableModal>
  );
}
