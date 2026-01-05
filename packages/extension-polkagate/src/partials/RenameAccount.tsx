// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '../util/handleExtensionPopup';

import { Grid, Typography } from '@mui/material';
import { Edit2, User } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { Address2, DecisionButtons, ExtensionPopup, MySnackbar, MyTextField } from '../components';
import { useSelectedAccount, useTranslation } from '../hooks';
import { editAccount } from '../messaging';

interface Props {
  onClose: ExtensionPopupCloser;
  open: boolean;
}

/**
 * A component for renaming an account. It allows the user to input a new name
 * for their account and applies the change on confirmation.
 *
 * Only has been used in extension mode!
 */
function RenameAccount ({ onClose, open }: Props): React.ReactElement {
  const { t } = useTranslation();
  const account = useSelectedAccount();

  const [newName, setNewName] = useState<string | undefined>();
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleClose = useCallback(() => {
    setShowSnackbar(false);
    setNewName(undefined); // to reset on re open
    onClose();
  }, [onClose]);

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
      <Grid container item justifyContent='center' sx={{ position: 'relative', px: '5px', zIndex: 1 }}>
        <Typography color='#BEAAD8' variant='B-4'>
          {t('Choose a new name for your account')}
        </Typography>
        {account &&
          <Address2
            address={account?.address}
            name={account?.name}
            style={{ mt: '15px' }}
          />
        }
        <MyTextField
          Icon={User}
          focused
          iconSize={18}
          inputValue={ newName }
          onEnterPress={onRename}
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
