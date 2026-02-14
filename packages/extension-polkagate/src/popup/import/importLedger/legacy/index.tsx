// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';
import type { DropdownOption } from '@polkadot/extension-polkagate/util/types';
import type { HexString } from '@polkadot/util/types';

import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { openOrFocusTab } from '@polkadot/extension-polkagate/src/fullscreen/accountDetails/components/CommonTasks';
import { updateStorage } from '@polkadot/extension-polkagate/src/util';
import { PROFILE_TAGS, STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import settings from '@polkadot/ui-settings';

import { DecisionButtons, DropSelect } from '../../../../components';
import { OnboardTitle } from '../../../../fullscreen/components/index';
import { useLedger, useTranslation } from '../../../../hooks';
import { createAccountHardware, getMetadata } from '../../../../messaging';
import LedgerErrorMessage from '../../../signing/ledger/LedgerErrorMessage';
import ManualLedgerImport from '../partials/ManualLedgerImport';
import { networkOps } from '../partials/partials';
import { MODE } from '..';
import Steps from './Steps';

interface Props {
  setMode: React.Dispatch<React.SetStateAction<number>>;
}

export default function LegacyApps({ setMode }: Props): React.ReactElement {
  const { t } = useTranslation();
  const ref = useRef(null);

  const [isBusy, setIsBusy] = useState(false);
  const [accountIndex, setAccountIndex] = useState<number>(0);
  const [addressOffset, setAddressOffset] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [genesis, setGenesis] = useState<string>();
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

  const name = useCallback((index: number, offset?: number) => `Legacy ${index ?? 0}-${offset ?? 0} `, []);

  const onImport = useCallback(() => {
    if (address && genesis) {
      setIsBusy(true);

      createAccountHardware(address, 'ledger', accountIndex, addressOffset, name(accountIndex, addressOffset), genesis as HexString)
        .then(() => {
          setStorage(STORAGE_KEY.SELECTED_PROFILE, PROFILE_TAGS.LEDGER).catch(console.error);
          setStorage(STORAGE_KEY.CHECK_BALANCE_ON_ALL_CHAINS, true).catch(console.error);
          updateStorage(STORAGE_KEY.CHECK_PROXIED, [address], true).catch(console.error);
          openOrFocusTab('/', true);
        })
        .catch((error: Error) => {
          console.error(error);

          setIsBusy(false);
          setError(error.message);
        });
    }
  }, [accountIndex, address, addressOffset, genesis, name]);

  const onBack = useCallback(() => setMode(MODE.INDEX), [setMode]);
  const onSelectChange = useCallback((value: string | number) => setGenesis(String(value)), [setGenesis]);

  return (
    <Stack direction='column' sx={{ height: '545px', position: 'relative', width: '500px' }}>
      <OnboardTitle
        label={t('Legacy app')}
        labelPartInColor={t('app')}
        onBack={onBack}
      />
      <Steps />
      <Grid container item justifyContent='space-between' mb='25px' mt='10px'>
        <Typography color='#EAEBF1' variant='B-1'>
          {t('Select the chain')}
        </Typography>
        <DropSelect
          defaultValue={newChain?.genesisHash || networkOps[0].value || ''}
          displayContentType='logo'
          onChange={onSelectChange}
          options={networkOps as DropdownOption[]}
          style={{
            marginTop: '12px',
            width: 'calc(100% - 30px)'
          }}
          value={genesis}
        />
      </Grid>
      {!ledgerWarning && !ledgerError && genesis &&
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
      {!!ledgerWarning &&
        <LedgerErrorMessage error={ledgerWarning} />
      }
      {(!!error || !!ledgerError) &&
        <LedgerErrorMessage error={error || ledgerError || ''} />
      }
      <DecisionButtons
        cancelButton
        direction='horizontal'
        disabled={ledgerLocked ? false : (!!error || !!ledgerError || !address || !newChain || !genesis || !name)}
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
