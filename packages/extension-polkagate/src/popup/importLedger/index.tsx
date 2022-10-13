// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import settings from '@polkadot/ui-settings';

import { AccountContext, ActionContext, DropdownWithIcon, Warning } from '../../components';
import Address from '../../components/Address';
import PButton from '../../components/PButton';
import { useLedger, useMetadata, useTranslation } from '../../hooks';
import useGenesisHashOptions from '../../hooks/useGenesisHashOptions';
import { createAccountHardware, createAccountSuri, getMetadata } from '../../messaging';
import HeaderBrand from '../../partials/HeaderBrand';
import { DEFAULT_TYPE } from '../../util/defaultType';
import getLogo from '../../util/getLogo';
import ledgerChains from '../../util/legerChains';

interface AccOption {
  text: string;
  value: number;
}

interface NetworkOption {
  text: string;
  value: string | null;
}

const AVAIL: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

export interface AccountInfo {
  address: string;
  genesis?: string;
  suri: string;
}

function ImportLedger(): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const genesisOptions = useGenesisHashOptions();

  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [step1, setStep1] = useState(true);
  const [type, setType] = useState(DEFAULT_TYPE);
  const chain = useMetadata(account && account.genesis, true);

  const [accountIndex, setAccountIndex] = useState<number>(0);
  const [addressOffset, setAddressOffset] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [genesis, setGenesis] = useState<string | null>(null);
  const { address, error: ledgerError, isLoading: ledgerLoading, isLocked: ledgerLocked, refresh, warning: ledgerWarning } = useLedger(genesis, accountIndex, addressOffset);
  const [newChain, setNewChain] = useState<Chain | null>(null);

  useEffect(() => {
    genesis && getMetadata(genesis, true).then(setNewChain).catch((error): void => {
      console.error(error);
      setNewChain(null);
    });
  }, [genesis]);

  useEffect(() => {
    if (address) {
      settings.set({ ledgerConn: 'webusb' });
    }
  }, [address]);

  const accOps = useRef(AVAIL.map((value): AccOption => ({
    text: t('Account type {{index}}', { replace: { index: value } }),
    value
  })));

  const addOps = useRef(AVAIL.map((value): AccOption => ({
    text: t('Address index {{index}}', { replace: { index: value } }),
    value
  })));

  const networkOps = useRef(
    [{
      text: t('Select network'),
      value: ''
    },
    ...ledgerChains.map(({ displayName, genesisHash }): NetworkOption => ({
      text: displayName,
      value: genesisHash[0]
    }))]
  );

  const _onSave = useCallback(
    () => {
      if (address && genesis && name) {
        setIsBusy(true);

        createAccountHardware(address, 'ledger', accountIndex, addressOffset, name, genesis)
          .then(() => onAction('/'))
          .catch((error: Error) => {
            console.error(error);

            setIsBusy(false);
            setError(error.message);
          });
      }
    },
    [accountIndex, address, addressOffset, genesis, name, onAction]
  );

  // select element is returning a string
  const _onSetAccountIndex = useCallback((value: number) => setAccountIndex(Number(value)), []);
  const _onSetAddressOffset = useCallback((value: number) => setAddressOffset(Number(value)), []);

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

  const _onChangeNetwork = useCallback(
    (newGenesisHash: string) => setGenesis(newGenesisHash),
    []
  );

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
      <div>
        <Address
          address={address}
          genesisHash={genesis}
          isExternal
          isHardware
          name={name}
        />
      </div>
      <DropdownWithIcon
        defaultValue={networkOps.current[0].text}
        icon={getLogo(newChain ?? undefined)}
        label={t<string>('Select the chain')}
        onChange={setGenesis}
        options={networkOps.current}
        style={{ margin: 'auto', p: 0, width: '92%' }}
      />
      {!!ledgerWarning && (
        <Warning>
          {ledgerWarning}
        </Warning>
      )}
      {(!!error || !!ledgerError) && (
        <Warning
          isDanger
        >
          {error || ledgerError}
        </Warning>
      )}
      {ledgerLocked
        ? <PButton
          _onClick={refresh}
          // _isBusy={!address || !!error}
          text={t<string>('Refresh')}
        />
        : <PButton
          _onClick={_onSave}
          disabled={!!error || !!ledgerError || !address || !genesis}
          text={t<string>('Import')}
        />
      }
    </>
  );
}

export default ImportLedger;
