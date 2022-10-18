// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AccountContext, AccountNamePasswordCreation, ActionContext, Address } from '../../components';
import { useMetadata, useTranslation } from '../../hooks';
import { createAccountSuri } from '../../messaging';
import HeaderBrand from '../../partials/HeaderBrand';
import { DEFAULT_TYPE } from '../../util/defaultType';
import SeedAndPath from './SeedAndPath';

export interface AccountInfo {
  address: string;
  genesis?: string;
  suri: string;
}

function ImportSeed(): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [step1, setStep1] = useState(true);
  const [type, setType] = useState(DEFAULT_TYPE);
  const chain = useMetadata(account && account.genesis, true);

  useEffect((): void => {
    !accounts.length && onAction();
  }, [accounts, onAction]);

  useEffect((): void => {
    setType(
      chain && chain.definition.chainType === 'ethereum'
        ? 'ethereum'
        : DEFAULT_TYPE
    );
  }, [chain]);

  const _onCreate = useCallback((name: string, password: string): void => {
    // this should always be the case
    if (name && password && account) {
      setIsBusy(true);

      createAccountSuri(name, password, account.suri, type, account.genesis)
        .then(() => onAction('/'))
        .catch((error): void => {
          setIsBusy(false);
          console.error(error);
        });
    }
  }, [account, onAction, type]);

  const _onNextStep = useCallback(
    () => setStep1(false),
    []
  );

  const _onCancelClick = useCallback(
    () => setStep1(true),
    []
  );

  const _onBackClick = useCallback(() => {
    step1 ? onAction('/') : _onCancelClick();
  }, [_onCancelClick, onAction, step1]);

  return (
    <>
      <HeaderBrand
        onBackClick={_onBackClick}
        showBackArrow
        text={t<string>('Import Account')}
        withSteps={{
          currentStep: `${step1 ? 1 : 2}`,
          totalSteps: 2
        }}
      />
      <Typography
        fontSize='14px'
        fontWeight={300}
        m='20px auto'
        textAlign='left'
        width='88%'
      >
        {t<string>('Enter a Mnemonic seed (recovery phrase) of an account to import it.')}
      </Typography>
      <div>
        <Address
          address={account?.address}
          genesisHash={account?.genesis}
          name={name}
          showCopy={!!account?.address}
        />
      </div>
      {step1
        ? (
          <SeedAndPath
            onAccountChange={setAccount}
            onNextStep={_onNextStep}
            type={type}
          />
        )
        : (
          <div style={{ marginTop: '-20px' }}>
            <AccountNamePasswordCreation
              buttonLabel={t<string>('Add account')}
              isBusy={isBusy}
              onBackClick={_onCancelClick}
              onCreate={_onCreate}
              onNameChange={setName}
              withCancel
            />
          </div>
        )
      }
    </>
  );
}

export default ImportSeed;
