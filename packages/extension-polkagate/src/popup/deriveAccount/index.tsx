// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@mui/material';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { AccountContext, AccountNamePasswordCreation, ActionContext, Address, Label } from '../../components';
import { useTranslation } from '../../hooks';
import { deriveAccount } from '../../messaging';
import HeaderBrand from '../../partials/HeaderBrand';
import SelectParent from './SelectParent';

interface Props {
  isLocked?: boolean;
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

function Derive({ isLocked }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const { accounts } = useContext(AccountContext);
  const { address: parentAddress } = useParams<AddressState>();
  const [isBusy, setIsBusy] = useState(false);
  const [account, setAccount] = useState<null | PathState>(null);
  const [name, setName] = useState<string | null>(null);
  const [parentPassword, setParentPassword] = useState<string | null>(null);
  const [stepOne, setStep] = useState<boolean>(true);

  const parentGenesis = useMemo(
    () => accounts.find((a) => a.address === parentAddress)?.genesisHash || undefined,
    [accounts, parentAddress]
  );

  const parentName = useMemo(
    () => accounts.find((a) => a.address === parentAddress)?.name || null,
    [accounts, parentAddress]
  );

  const _onCreate = useCallback((name: string, password: string) => {
    if (!account || !name || !password || !parentPassword) {
      return;
    }

    setIsBusy(true);
    deriveAccount(parentAddress, account.suri, parentPassword, name, password, parentGenesis)
      .then(() => onAction('/'))
      .catch((error): void => {
        setIsBusy(false);
        console.error(error);
      });
  }, [account, onAction, parentAddress, parentGenesis, parentPassword]);

  const _onDerivationConfirmed = useCallback(({ account, parentPassword }: ConfirmState) => {
    setAccount(account);
    setParentPassword(parentPassword);
    setStep(false);
  }, []);

  const _onBackClick = useCallback(() => {
    if (stepOne) {
      onAction('/');
    } else {
      setAccount(null);
      setStep(true);
    }
  }, [onAction, stepOne]);

  return (
    <>
      <HeaderBrand
        onBackClick={_onBackClick}
        showBackArrow
        text={t<string>('Derive Account')}
        withSteps={{
          current: `${stepOne ? '1' : '2'}`,
          total: 2
        }}
      />
      <Typography
        fontSize='14px'
        fontWeight={300}
        m='25px auto'
        textAlign='left'
        width='88%'
      >
        {t<string>('A derived account inherits the mnemonic from its parent, but has a unique derivation path.')}
      </Typography>
      {stepOne && !account && (
        <>
          <SelectParent
            isLocked={isLocked}
            onDerivationConfirmed={_onDerivationConfirmed}
            parentAddress={parentAddress}
            parentGenesis={parentGenesis}
            parentName={parentName}
          />
        </>
      )}
      {!stepOne && account && (
        <>
          <Label
            label={t<string>('New derived account')}
            style={{ margin: 'auto', width: '92%' }}
          >
            <Address
              address={account.address}
              genesisHash={parentGenesis}
              margin='0'
              name={name}
              width={'100%'}
            />
          </Label>
          <AccountNamePasswordCreation
            buttonLabel={t<string>('Create')}
            isBusy={isBusy}
            onBackClick={_onBackClick}
            onCreate={_onCreate}
            onNameChange={setName}
          />
        </>
      )}
    </>
  );
}

export default React.memo(Derive);
