// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AccountContext, ActionContext } from '../../../../extension-ui/src/components';
import AccountNamePasswordCreation from '../../../../extension-ui/src/components/AccountNamePasswordCreation'
import useMetadata from '../../hooks/useMetadata';
import useTranslation from '../../../../extension-ui/src/hooks/useTranslation';
import { createAccountSuri } from '../../../../extension-ui/src/messaging';
import { DEFAULT_TYPE } from '../../../../extension-ui/src/util/defaultType';
import Address from '../../components/Address';
import HeaderBrand from '../../partials/HeaderBrand';
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
        text={t<string>(`Import Account (${step1 ? 1 : 2}/2)`)}
      />
      <div>
        <Address
          address={account?.address}
          genesisHash={account?.genesis}
          name={name}
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
