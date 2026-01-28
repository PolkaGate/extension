// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';
import type { HexString } from '@polkadot/util/types';
import type { DropdownOption } from '../../../../util/types';

import { Grid, Stack, Typography } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import LedgerErrorMessage from '@polkadot/extension-polkagate/src/popup/signing/ledger/LedgerErrorMessage';
import { DISABLED_NETWORKS, PROFILE_TAGS, STATEMINT_GENESIS_HASH, STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { DecisionButtons, DropSelect } from '../../../../components';
import { setStorage } from '../../../../components/Loading';
import { openOrFocusTab } from '../../../../fullscreen/accountDetails/components/CommonTasks';
import { OnboardTitle } from '../../../../fullscreen/components/index';
import { useGenericLedger, useTranslation } from '../../../../hooks';
import { createAccountHardware, getMetadata, updateMeta } from '../../../../messaging';
import ledgerChains from '../../../../util/legerChains';
import ManualLedgerImport from '../partials/ManualLedgerImport';
import { type NetworkOption } from '../partials/partials';
import { MODE } from '..';
import Steps from './Steps';

interface Props {
  setMode: React.Dispatch<React.SetStateAction<number>>;
}

export default function MigrationApp({ setMode }: Props): React.ReactElement {
  const { t } = useTranslation();
  const ref = useRef(null);

  const [isBusy, setIsBusy] = useState(false);
  const [accountIndex, setAccountIndex] = useState<number>(0);
  const [addressOffset, setAddressOffset] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [genesis, setGenesis] = useState<string>();
  const [newChain, setNewChain] = useState<Chain | null>(null);

  const chainSlip44 = useMemo(() =>
    newChain?.genesisHash
      ? ledgerChains.find(({ genesisHash }) => genesisHash.includes(newChain.genesisHash as HexString))?.slip44 ?? null
      : null
    , [newChain]);

  const { address, error: ledgerError, isLoading: ledgerLoading, isLocked: ledgerLocked, refresh } = useGenericLedger(accountIndex, addressOffset, chainSlip44);

  const networkOps = useRef(
    [{
      text: t('Select chain'),
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

  const onImport = useCallback(() => {
    address && createAccountHardware(address, 'ledger', accountIndex, addressOffset, name(accountIndex, addressOffset), (newChain?.genesisHash || POLKADOT_GENESIS) as HexString)
      .then(() => {
        const metaData = JSON.stringify({ isMigration: true });

        updateMeta(String(address), metaData)
          .then(() => {
            setStorage(STORAGE_KEY.SELECTED_PROFILE, PROFILE_TAGS.LEDGER).catch(console.error);
            openOrFocusTab('/', true);
          })
          .catch(console.error);
      })
      .catch((error: Error) => {
        console.error(error);

        setIsBusy(false);
        setError(error.message);
      });
  }, [accountIndex, address, addressOffset, name, newChain?.genesisHash]);

  const onBack = useCallback(() => setMode(MODE.INDEX), [setMode]);
  const onSelectChange = useCallback((value: string | number) => setGenesis(String(value)), [setGenesis]);

  return (
    <Stack direction='column' sx={{ height: '545px', position: 'relative', width: '500px' }}>
      <OnboardTitle
        label={t('Ledger Account Migration')}
        labelPartInColor={t('Account Migration')}
        onBack={onBack}
      />
      <Steps />
      <Grid container item justifyContent='space-between' mb='25px' mt='10px'>
        <Typography color='#EAEBF1' variant='B-1'>
          {t('Select the chain')}
        </Typography>
        <DropSelect
          defaultValue={newChain?.genesisHash || networkOps.current[0].value || ''}
          displayContentType='logo'
          onChange={onSelectChange}
          options={networkOps.current as DropdownOption[]}
          style={{
            marginTop: '12px',
            width: 'calc(100% - 30px)'
          }}
          value={genesis}
        />
      </Grid>
      {!!chainSlip44 && !ledgerError &&
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
          style={{ marginTop: 0 }}
        />
      }
      {(!!error || !!ledgerError) && chainSlip44 &&
        <LedgerErrorMessage error={error || ledgerError || ''} />
      }
      <DecisionButtons
        cancelButton
        direction='horizontal'
        disabled={ledgerLocked ? false : (!!error || !!ledgerError || !address || !newChain)}
        isBusy={ledgerLocked ? false : isBusy}
        onPrimaryClick={ledgerLocked ? refresh : onImport}
        onSecondaryClick={onBack}
        primaryBtnText={ledgerLocked ? t('Refresh') : t('Import')}
        secondaryBtnText={t('Back')}
        showChevron
        style={{ flexDirection: 'row-reverse', margin: '20px 0', width: '65%' }}
      />
    </Stack>
  );
}
