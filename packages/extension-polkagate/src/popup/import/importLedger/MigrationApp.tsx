// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Chain } from '@polkadot/extension-chains/types';
import type { HexString } from '@polkadot/util/types';
import type { DropdownOption } from '../../../util/types';

import { Grid, Typography, useTheme } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Title } from '@polkadot/extension-polkagate/src/fullscreen/sendFund/InputPage';
import { DISABLED_NETWORKS, FULLSCREEN_WIDTH, STATEMINT_GENESIS_HASH } from '@polkadot/extension-polkagate/src/util/constants';

import { SelectChain, TwoButtons, VaadinIcon, Warning } from '../../../components';
import { setStorage } from '../../../components/Loading';
import { openOrFocusTab } from '../../../fullscreen/accountDetails/components/CommonTasks';
import { useGenericLedger, useTranslation } from '../../../hooks';
import { PROFILE_TAGS } from '../../../hooks/useProfileAccounts';
import { createAccountHardware, getMetadata, updateMeta } from '../../../messaging';
import getLogo from '../../../util/getLogo';
import ledgerChains from '../../../util/legerChains';
import ManualLedgerImport from './ManualLedgerImport';
import { type NetworkOption } from './partials';
import { MODE } from '.';

interface Props {
  setMode: React.Dispatch<React.SetStateAction<number>>;
}

export default function MigrationApp({ setMode }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const ref = useRef(null);

  const [isBusy, setIsBusy] = useState(false);
  const [accountIndex, setAccountIndex] = useState<number>(0);
  const [addressOffset, setAddressOffset] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [genesis, setGenesis] = useState<string | null>(null);
  const [newChain, setNewChain] = useState<Chain | null>(null);

  const chainSlip44 = useMemo(() =>
    newChain?.genesisHash
      ? ledgerChains.find(({ genesisHash }) => genesisHash.includes(newChain.genesisHash as HexString))?.slip44 ?? null
      : null
    , [newChain]);

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
    address && createAccountHardware(address, 'ledger', accountIndex, addressOffset, name(accountIndex, addressOffset), (newChain?.genesisHash || POLKADOT_GENESIS) as HexString)
      .then(() => {
        const metaData = JSON.stringify({ isMigration: true });

        updateMeta(String(address), metaData)
          .then(() => {
            setStorage('profile', PROFILE_TAGS.LEDGER).catch(console.error);
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

  const onBack = useCallback(() => {
    setMode(MODE.INDEX);
  }, [setMode]);

  return (
    <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll' }}>
      <Grid container item sx={{ display: 'block', px: '10%' }}>
        <Title
          height='85px'
          logo={
            <VaadinIcon icon='vaadin:automation' style={{ color: `${theme.palette.text.primary}`, height: '25px', width: '25px' }} />
          }
          text={t('Ledger Account Migration')}
        />
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
              disabled={ledgerLocked ? false : (!!error || !!ledgerError || !address || !newChain)}
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
