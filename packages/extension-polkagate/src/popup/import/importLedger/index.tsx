// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import settings from '@polkadot/ui-settings';

import { AccountContext, ActionContext, Address, PButton, Select, SelectChain, Warning } from '../../../components';
import { useLedger, useTranslation } from '../../../hooks';
import { createAccountHardware, getMetadata } from '../../../messaging';
import { HeaderBrand, Name } from '../../../partials';
import getLogo from '../../../util/getLogo';
import ledgerChains from '../../../util/legerChains';

interface AccOption {
  text: string;
  value: number;
}

interface NetworkOption {
  text: string;
  value: string | null;
}

const AVAIL: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

export default function ImportLedger (): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [step1, setStep1] = useState(true);
  const [accountIndex, setAccountIndex] = useState<number>(0);
  const [addressOffset, setAddressOffset] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [genesis, setGenesis] = useState<string | null>(null);
  const { address, error: ledgerError, isLoading: ledgerLoading, isLocked: ledgerLocked, refresh, warning: ledgerWarning } = useLedger(genesis, accountIndex, addressOffset);
  const [newChain, setNewChain] = useState<Chain | null>(null);
  const theme = useTheme();

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
      text: t('No chain selected'),
      value: ''
    },
    ...ledgerChains.map(({ displayName, genesisHash }): NetworkOption => ({
      text: displayName,
      value: genesisHash[0]
    }))]
  );

  const _onSave = useCallback(() => {
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
  }, [accountIndex, address, addressOffset, genesis, name, onAction]);

  // select element is returning a string
  const _onSetAccountIndex = useCallback((value: number) => {
    setAccountIndex(Number(value));
  }, []);

  const _onSetAddressOffset = useCallback((value: number) => {
    setAddressOffset(Number(value));
  }, []);

  useEffect((): void => {
    !accounts.length && onAction();
  }, [accounts, onAction]);

  const _onNextStep = useCallback(() => {
    setStep1(false);
  }, []);

  const _onCancelClick = useCallback(() => {
    setStep1(true);
  }, []);

  const _onBackClick = useCallback(() => {
    step1 ? onAction('/') : _onCancelClick();
  }, [_onCancelClick, onAction, step1]);

  useEffect(() => {
    !!name && _onNextStep();
  }, [_onNextStep, name]);

  return (
    <>
      <HeaderBrand
        onBackClick={_onBackClick}
        showBackArrow
        text={t<string>('Import Account')}
        withSteps={{
          current: `${step1 ? 1 : 2}`,
          total: 2
        }}
      />
      <Typography fontSize='14px' fontWeight={300} m='20px auto' textAlign='left' width='88%'>
        <b>1</b>. {t<string>('Connect your ledger device to the computer.')}<br />
        <b>2</b>. {t<string>('Open your desired App on the ledger device.')}<br />
        <b>3</b>. {t<string>('Select the relevant chain of your desired App from below.')}<br />
      </Typography>
      <div>
        <Address
          address={address}
          genesisHash={genesis}
          isHardware
          name={name}
        />
      </div>
      <SelectChain
        address={address || 'dummy'} //dummy address just to make select enable
        defaultValue={newChain?.genesisHash || networkOps.current[0].text}
        icon={getLogo(newChain ?? undefined)}
        label={t<string>('Select the chain')}
        onChange={setGenesis}
        options={networkOps.current}
        style={{ margin: 'auto', p: 0, width: '92%' }}
      />
      {!!genesis && !!address && !ledgerError && (
        <Name
          onChange={setName}
          value={name || ''}
        />
      )}
      {!!name && (
        <Container disableGutters sx={{ p: '20px 15px' }}>
          <Select
            defaultValue={accOps.current[0].text}
            isDisabled={ledgerLoading}
            label={t<string>('account type')}
            onChange={_onSetAccountIndex}
            options={accOps.current}
          />
          <Select
            _mt='20px'
            defaultValue={addOps.current[0].text}
            isDisabled={ledgerLoading}
            label={t<string>('address index')}
            onChange={_onSetAddressOffset}
            options={addOps.current}
          />
        </Container>
      )}
      {!!ledgerWarning && (
        <Warning theme={theme}>
          {ledgerWarning}
        </Warning>
      )}
      {(!!error || !!ledgerError) && (
        <Warning
          isDanger
          theme={theme}
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
          _isBusy={isBusy}
          _onClick={_onSave}
          disabled={!!error || !!ledgerError || !address || !genesis || !name}
          text={t<string>('Import')}
        />
      }
    </>
  );
}
