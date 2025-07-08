// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import { Edit2, User } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import MySnackbar from '@polkadot/extension-polkagate/src/popup/settings/extensionSettings/components/MySnackbar';

import { Address2, DecisionButtons, MyTextField } from '../../components';
import { useTranslation } from '../../hooks';
import { editAccount } from '../../messaging';
import { SharePopup } from '../../partials';

interface Props {
  address: string | undefined;
  setPopup: React.Dispatch<React.SetStateAction<any | undefined>>;
  open: any | undefined;
}

function RenameAccount({ address, open, setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [newName, setNewName] = useState<string | undefined>();
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleClose = useCallback(() => {
    setShowSnackbar(false);
    setPopup(undefined);
  }, [setPopup]);
  const onNameChange = useCallback((text?: string) => setNewName(text), [setNewName]);
  const onRename = useCallback(() => {
    newName && address &&
      editAccount(address, newName).then(() => {
        setShowSnackbar(true);
      })
        .catch(console.error);
  }, [address, newName]);

  return (
    <SharePopup
      modalProps={{ showBackIconAsClose: true }}
      modalStyle={{ minHeight: '200px' }}
      onClose={handleClose}
      open={open !== undefined}
      popupProps={{ TitleIcon: Edit2, iconSize: 24, pt: 185 }}
      title={t('Rename Account')}
    >
      <Grid container item justifyContent='center' sx={{ position: 'relative', zIndex: 1, px: '5px' }}>
        {
          address &&
          <Address2
            address={address}
          />
        }
        <MyTextField
          Icon={User}
          focused
          iconSize={18}
          onEnterPress={onRename}
          onTextChange={onNameChange}
          placeholder={t('Enter your name')}
          style={{ margin: '20px 0 30px' }}
          title={t('Choose a new name for your account')}
        />
        <DecisionButtons
          cancelButton
          direction='vertical'
          disabled={!newName}
          onPrimaryClick={onRename}
          onSecondaryClick={handleClose}
          primaryBtnText={t('Apply')}
          secondaryBtnText={t('Cancel')}
        />
        <MySnackbar
          onClose={handleClose}
          open={showSnackbar}
          text={t('Account successfully renamed!')}
        />
      </Grid>
    </SharePopup>
  );
}

export default React.memo(RenameAccount);
