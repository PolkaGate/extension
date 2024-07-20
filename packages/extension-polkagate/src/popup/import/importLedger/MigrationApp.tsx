// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Chain } from '@polkadot/extension-chains/types';

import { DISABLED_NETWORKS, FULLSCREEN_WIDTH, STATEMINT_GENESIS_HASH } from '@polkadot/extension-polkagate/src/util/constants';

import { ActionContext, Address, Select, SelectChain, TwoButtons, VaadinIcon, Warning } from '../../../components';
import { useGenericLedger, useTranslation } from '../../../hooks';
import { createAccountHardware, getMetadata, updateMeta } from '../../../messaging';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { MODE } from '.';
import ledgerChains from '../../../util/legerChains';
import getLogo from '../../../util/getLogo';
import type { DropdownOption } from '../../../util/types';
import type { AccOption } from './LegacyApps';
import { AVAIL, hideAddressAnimation, showAddressAnimation } from './partials';

interface Props {
  setMode: React.Dispatch<React.SetStateAction<number>>;
}

interface NetworkOption {
  text: string;
  value: string | null;
}

interface ManualLedgerImportProps {
  accountIndex: number;
  address: string | null;
  addressOffset: number;
  genesisHash: string | undefined;
  ledgerLoading: boolean;
  name: (index: number, offset?: number) => string;
  ref: React.MutableRefObject<null>;
  setAccountIndex: React.Dispatch<React.SetStateAction<number>>;
  setAddressOffset: React.Dispatch<React.SetStateAction<number>>;
}

export function ManualLedgerImport({ address, accountIndex, addressOffset, genesisHash, ledgerLoading, name, ref, setAccountIndex, setAddressOffset }: ManualLedgerImportProps): React.ReactElement {
  const { t } = useTranslation();

  const accOps = useRef(AVAIL.map((index): AccOption => ({
    text: t('Account index {{index}}', { replace: { index } }),
    value: index
  })));

  const addOps = useRef(AVAIL.map((offset): AccOption => ({
    text: t('Address offset {{offset}}', { replace: { offset } }),
    value: offset
  })));

  const _onSetAccountIndex = useCallback((_value: number | string) => {
    const index = accOps.current.find(({ text, value }) => text === _value || value === _value)?.value || 0;

    setAccountIndex(Number(index));
  }, []);

  const _onSetAddressOffset = useCallback((_value: number | string) => {
    const index = addOps.current.find(({ text, value }) => text === _value || value === _value)?.value || 0;

    setAddressOffset(Number(index));
  }, []);

  return (
    <>
      <Grid container item justifyContent='space-between' mt='15px'>
        <Grid item md={5.5} xs={12}>
          <Select
            defaultValue={accOps.current[0].value}
            isDisabled={ledgerLoading}
            label={t('Account index')}
            onChange={_onSetAccountIndex}
            options={accOps.current}
            value={accountIndex}
          />
        </Grid>
        <Grid item md={5.5} xs={12}>
          <Select
            defaultValue={addOps.current[0].value}
            isDisabled={ledgerLoading}
            label={t('Address offset')}
            onChange={_onSetAddressOffset}
            options={addOps.current}
            value={addressOffset}
          />
        </Grid>
      </Grid>
      <Grid container ref={ref} sx={{ minHeight: '50px', maxHeight: '500px', overflowY: 'scroll', scrollbarWidth: 'thin', scrollBehavior: 'auto' }}>
        <Grid container display={address ? 'inherit' : 'none'} item overflow='hidden' sx={{ animationDuration: address ? '300ms' : '150ms', animationFillMode: 'forwards', animationName: `${address ? showAddressAnimation : hideAddressAnimation}`, animationTimingFunction: 'linear', mt: '15px' }}>
          <Address
            address={address}
            genesisHash={genesisHash}
            backgroundColor='background.main'
            margin='0px'
            name={name(accountIndex, addressOffset)}
            style={{ width: '100%' }}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default function MigrationApp({ setMode }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const ref = useRef(null);

  const onAction = useContext(ActionContext);

  const [isBusy, setIsBusy] = useState(false);
  const [accountIndex, setAccountIndex] = useState<number>(0);
  const [addressOffset, setAddressOffset] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [genesis, setGenesis] = useState<string | null>(null);
  const [newChain, setNewChain] = useState<Chain | null>(null);

  const chainSlip44 = useMemo(() => {
    if (newChain?.genesisHash) {
      return ledgerChains.find(({ genesisHash }) => genesisHash.includes(newChain.genesisHash as any))?.slip44 ?? null
    }
    return null;
  }, [newChain, ledgerChains]);

  const { address, error: ledgerError, isLoading: ledgerLoading, isLocked: ledgerLocked, refresh, warning: ledgerWarning } = useGenericLedger(accountIndex, addressOffset, chainSlip44);

  const networkOps = useRef(
    [{
      text: t('No chain selected'),
      value: ''
    },
    ...ledgerChains.filter(
      ({ displayName, genesisHash }) =>
      !genesisHash.includes(POLKADOT_GENESIS) && !genesisHash.includes(STATEMINT_GENESIS_HASH) && !DISABLED_NETWORKS.includes(displayName)
    ).map(({ displayName, genesisHash }): NetworkOption => ({
        text: displayName,
        value: genesisHash[0]
      }))]
  );

  useEffect(() => {
    genesis && getMetadata(genesis, true).then(setNewChain).catch((error): void => {
      console.error(error);
      setNewChain(null);
    });
  }, [genesis]);

  const name = useCallback((index: number, offset?: number) => `Migration ${index ?? 0}-${offset ?? 0} `, []);

  const onSave = useCallback(() => {
    address && createAccountHardware(address, 'ledger', accountIndex, addressOffset, name(accountIndex, addressOffset), newChain?.genesisHash || POLKADOT_GENESIS)
      .then(() => {
        const metaData = JSON.stringify({ isMigration: true });

        updateMeta(String(address), metaData)
          .then(() => onAction('/'))
      })
      .catch((error: Error) => {
        console.error(error);

        setIsBusy(false);
        setError(error.message);
      });
  }, [accountIndex, address, onAction]);

  const onBack = useCallback(() => {
    setMode(MODE.INDEX);
  }, []);

  return (
    <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll' }}>
      <Grid container item sx={{ display: 'block', px: '10%' }}>
        <Grid alignContent='center' alignItems='center' container item>
          <Grid item sx={{ mr: '20px' }}>
            <VaadinIcon icon='vaadin:file-tree' style={{ height: '40px', color: `${theme.palette.text.primary}`, width: '40px' }} />
          </Grid>
          <Grid item>
            <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
              {t('Ledger Account Migration')}
            </Typography>
          </Grid>
        </Grid>
        <Typography fontSize='16px' fontWeight={400} pt='15px' textAlign='left' width='100%'>
          <b>1</b>. {t('Connect your ledger device to the computer.')}<br />
          <b>2</b>. {t('Open Polkadot Migration App on the ledger device.')}<br />
          <b>3</b>. {t('Select the chain from which you want to migrate your account.')}<br />
          <b>4</b>. {t('Import the account with its index and offset. Leave defaults if unchanged.')}<br />
        </Typography>
        <Grid container item justifyContent='space-between' mb='25px' mt='10px'>
          <SelectChain
            address={address || 'dummy'} // dummy address just to make select enable
            defaultValue={newChain?.genesisHash || networkOps.current[0].text}
            icon={getLogo(newChain ?? undefined)}
            label={t('Select the chain')}
            onChange={setGenesis}
            options={networkOps.current as DropdownOption[]}
            style={{ mt: 3, width: '100%' }}
          />
        </Grid>
        {!!chainSlip44 && !ledgerWarning && !ledgerError &&
          <ManualLedgerImport
            accountIndex={accountIndex}
            address={address}
            addressOffset={addressOffset}
            genesisHash={newChain?.genesisHash}
            ledgerLoading={ledgerLoading}
            name={name}
            ref={ref}
            setAccountIndex={setAccountIndex}
            setAddressOffset={setAddressOffset}
          />
        }
        {!!ledgerWarning && (
          <Warning theme={theme}>
            {ledgerWarning}
          </Warning>
        )}
        {(!!error || !!ledgerError) && chainSlip44 && (
          <Warning
            isDanger
            theme={theme}
          >
            {error || ledgerError}
          </Warning>
        )}
        <Grid container item justifyContent='flex-end' pt='10px'>
          <Grid container item sx={{ '> div': { width: '100%' } }} xs={7}>
            <TwoButtons
              // FixMe: twoButtons are disabled on false input!
              disabled={ledgerLocked ? false : (!!error || !!ledgerError || !address)}
              isBusy={ledgerLocked ? false : isBusy}
              mt='30px'
              onPrimaryClick={ledgerLocked ? refresh : onSave}
              onSecondaryClick={onBack}
              primaryBtnText={ledgerLocked ? t('Refresh') : t('Import')}
              secondaryBtnText={t('Back')}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
