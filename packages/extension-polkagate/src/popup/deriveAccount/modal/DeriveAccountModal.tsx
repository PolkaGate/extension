// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';

import { ActionContext, Address, ButtonWithCancel, InputWithLabel, Label } from '../../../components';
import { useAccount, useTranslation } from '../../../hooks';
import { deriveAccount } from '../../../messaging';
import Passwords2 from '../../createAccountFullScreen/components/Passwords2';
import { DraggableModal } from '../../governance/components/DraggableModal';
import SelectParent from './SelectParent';

interface Props {
  parentAddress?: string | undefined;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
}

interface AddressState {
  address: string;
}

interface PathState extends AddressState {
  suri: string;
}

interface ConfirmState {
  account: PathState;
  parentPassword: string;
}

function DeriveModal ({ parentAddress, setDisplayPopup }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const theme = useTheme();

  const [isBusy, setIsBusy] = useState(false);
  const [account, setAccount] = useState<null | PathState>(null);
  const [name, setName] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [parentPassword, setParentPassword] = useState<string | null>(null);
  const [stepOne, setStep] = useState<boolean>(true);
  const [selectedParentAddress, setSelectedParentAddress] = useState<string | undefined>(parentAddress);

  const parentAccount = useAccount(parentAddress ?? selectedParentAddress);

  const onClose = useCallback(() => setDisplayPopup(undefined), [setDisplayPopup]);

  const onCreate = useCallback(() => {
    if (!account || !name || !password || !parentPassword || !parentAccount || !parentAddress) {
      return;
    }

    setIsBusy(true);
    deriveAccount(parentAddress, account.suri, parentPassword, name, password, parentAccount.genesisHash ?? null)
      .then(() => onClose())
      .catch((error): void => {
        setIsBusy(false);
        console.error(error);
      });
  }, [account, name, onClose, parentAccount, parentAddress, parentPassword, password]);

  const onDerivationConfirmed = useCallback(({ account, parentPassword }: ConfirmState) => {
    setAccount(account);
    setParentPassword(parentPassword);
    setStep(false);
  }, []);

  const onNameChange = useCallback((enteredName: string) => {
    // Remove leading white spaces
    const trimmedName = enteredName.replace(/^\s+/, '');

    // Remove multiple consecutive spaces in the middle or at the end
    const cleanedName = trimmedName.replace(/\s{2,}/g, ' ');

    setName(cleanedName);
  }, []);

  const onPasswordChange = useCallback((enteredPassword: string | null) => {
    setPassword(enteredPassword);
  }, []);

  const onBackClick = useCallback(() => {
    if (stepOne) {
      onAction('/');
    } else {
      setAccount(null);
      setStep(true);
    }
  }, [onAction, stepOne]);

  const CreateNewDerivedAccount = () => (
    <>
      <Label
        label={t<string>('New derived account')}
        style={{ margin: 'auto', marginBottom: '15px' }}
      >
        <Address
          address={account?.address}
          genesisHash={parentAccount?.genesisHash}
          name={name}
          style={{ m: 0, width: '100%' }}
        />
      </Label>
      <InputWithLabel
        isError={name === null || name?.length === 0}
        isFocused
        label={t<string>('Choose a name for this account')}
        onChange={onNameChange}
        value={name ?? ''}
      />
      <Passwords2
        firstPassStyle={{ marginBlock: '10px' }}
        label={t<string>('Password for this account (more than 5 characters)')}
        onChange={onPasswordChange}
        // eslint-disable-next-line react/jsx-no-bind
        onEnter={name && password ? onCreate : () => null}
      />
      <Grid container item sx={{ '> div': { ml: 'auto', width: '87.5%' }, bottom: 0, height: '36px', position: 'absolute' }}>
        <ButtonWithCancel
          _isBusy={isBusy}
          _onClick={onCreate}
          _onClickCancel={onBackClick}
          cancelText={t<string>('Back')}
          disabled={!password || !name}
          text={t<string>('Create')}
        />
      </Grid>
    </>
  );

  return (
    <DraggableModal onClose={onClose} open>
      <>
        <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {t<string>('Derive Account')}
            </Typography>
          </Grid>
          <Grid item>
            <CloseIcon onClick={onClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        <Typography fontSize='14px' fontWeight={300} m='25px auto' textAlign='left'>
          {t<string>('A derived account inherits the recovery phrase from its parent, but has a unique derivation path.')}
        </Typography>
        {stepOne && !account &&
          <SelectParent
            isLocked={!!parentAddress}
            onClose={onClose}
            onDerivationConfirmed={onDerivationConfirmed}
            parentAccount={parentAccount}
            selectedParentAddress={selectedParentAddress}
            setSelectedParentAddress={setSelectedParentAddress}
          />
        }
        {!stepOne && account &&
          <CreateNewDerivedAccount />
        }
      </>
    </DraggableModal>
  );
}

export default React.memo(DeriveModal);
