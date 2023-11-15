// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState, useMemo } from 'react';

import { ButtonWithCancel, NewAddress } from '../../components';
import { useAccountName, useTranslation } from '../../hooks';
import { editAccount } from '../../messaging';
import { Name } from '../../partials';
import { DraggableModal } from '../governance/components/DraggableModal';

interface Props {
  address: string;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export default function RenameModal({ address, setDisplayPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
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
        <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {t<string>('Rename Account')}
            </Typography>
          </Grid>
          <Grid item>
            <CloseIcon onClick={backToAccount} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
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
