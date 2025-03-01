// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Typography } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';

import { ActionContext } from '../../components';
import { useAccount, useTranslation } from '../../hooks';
import { deriveAccount } from '../../messaging';
import CreateNewDerivedAccount from '../../popup/newAccount/deriveAccount/modal/CreateNewDerivedAccount';
import SelectParent from '../../popup/newAccount/deriveAccount/modal/SelectParent';
import { DraggableModal } from '../governance/components/DraggableModal';
import SimpleModalTitle from './SimpleModalTitle';

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

function DeriveModal({ parentAddress, setDisplayPopup }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

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

  return (
    <DraggableModal onClose={onClose} open>
      <>
        <SimpleModalTitle
          icon='vaadin:road-branch'
          onClose={onClose}
          title={t('Derive Account')}
        />
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
          <CreateNewDerivedAccount
            address={account.address}
            derivedAccountName={name}
            isBusy={isBusy}
            onBackClick={onBackClick}
            onCreate={onCreate}
            onNameChange={onNameChange}
            onPasswordChange={onPasswordChange}
            password={password}
          />
        }
      </>
    </DraggableModal>
  );
}

export default React.memo(DeriveModal);
