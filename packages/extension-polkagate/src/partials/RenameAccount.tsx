// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import { Edit2, User } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { Address2, DecisionButtons, ExtensionPopup, MyTextField } from '../components';
import { useSelectedAccount, useTranslation } from '../hooks';
import { editAccount } from '../messaging';
import MySnackbar from '../popup/settings/extensionSettings/components/MySnackbar';
import { ExtensionPopups } from '../util/constants';

interface Props {
  setPopup: React.Dispatch<React.SetStateAction<ExtensionPopups>>;
  open: boolean;
}

function RenameAccount({ open, setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const account = useSelectedAccount();

  const [newName, setNewName] = useState<string | undefined>();
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleClose = useCallback(() => {
    setShowSnackbar(false);
    setPopup(ExtensionPopups.NONE);
  }, [setPopup]);
  const onNameChange = useCallback((text?: string) => setNewName(text), [setNewName]);
  const onRename = useCallback(() => {
    newName && account?.address &&
      editAccount(account.address, newName).then(() => {
        setShowSnackbar(true);
      })
        .catch(console.error);
  }, [account?.address, newName]);

  return (
    <ExtensionPopup
      TitleIcon={Edit2}
      handleClose={handleClose}
      openMenu={open}
      pt={20}
      title={t('Rename Account')}
      withoutTopBorder
    >
      <Grid container item justifyContent='center' sx={{ position: 'relative', zIndex: 1, px: '5px' }}>
        <Typography color='#BEAAD8' variant='B-4'>
          {t('Choose a new name for your account')}
        </Typography>
        {account &&
          <Address2
            address={account?.address}
            name={account?.name}
          />}
        <MyTextField
          Icon={User}
          focused
          iconSize={18}
          onTextChange={onNameChange}
          placeholder={t('Enter your name')}
          style={{ margin: '20px 0 140px' }}
          title={t('New name')}
        />
        <DecisionButtons
          direction='vertical'
          disabled={!newName}
          onPrimaryClick={onRename}
          onSecondaryClick={handleClose}
          primaryBtnText={t('Apply')}
          secondaryBtnText={t('Cancel')}
        />
      </Grid>
      <MySnackbar
        onClose={handleClose}
        open={showSnackbar}
        text={t('Account successfully renamed!')}
      />
    </ExtensionPopup>
  );
}

export default React.memo(RenameAccount);
