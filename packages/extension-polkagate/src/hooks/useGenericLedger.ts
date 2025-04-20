// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import uiSettings from '@polkadot/ui-settings';
import { assert } from '@polkadot/util';

import { POLKADOT_SLIP44 } from '../util/constants';
import { GenericLedger } from '../util/ledger/genericLedger';
import useTranslation from './useTranslation';

interface StateBase {
  isLedgerCapable: boolean;
  isLedgerEnabled: boolean;
}

interface State extends StateBase {
  address: string | null;
  error: string | null;
  isLoading: boolean;
  isLocked: boolean;
  ledger: GenericLedger | null;
  refresh: () => void;
  warning: string | null;
}

function getState (): StateBase {
  const isLedgerCapable = 'USB' in window;

  return {
    isLedgerCapable,
    isLedgerEnabled: isLedgerCapable && uiSettings.ledgerConn !== 'none'
  };
}

function retrieveLedger (chainSlip?: number | null, txMetadataChainId?: string): GenericLedger {
  console.log('2: useGenericLedger - retrieveLedger');

  const { isLedgerCapable } = getState();

  console.log('2-1: useGenericLedger - retrieveLedger- isLedgerCapable:', isLedgerCapable);

  assert(isLedgerCapable, 'Incompatible browser, only Chrome is supported');

  console.log('2-2:  useGenericLedger - retrieveLedger- chainSlip,txMetadataChainId:', chainSlip, txMetadataChainId);

  return new GenericLedger('webusb', chainSlip || POLKADOT_SLIP44, txMetadataChainId);
}

export function useGenericLedger (accountIndex = 0, addressOffset = 0, chainSlip?: number | null, txMetadataChainId?: string): State {
  const { t } = useTranslation();
  const isFetching = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [refreshLock, setRefreshLock] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const ledger = useMemo(() => {
    setError(null);
    setIsLocked(false);
    setRefreshLock(false);
    console.log('1: useGenericLedger - retrieving Ledger ...');

    try {
      return retrieveLedger(chainSlip, txMetadataChainId);
    } catch (error) {
      setError((error as Error).message);
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshLock, chainSlip, txMetadataChainId]);

  console.log('💡 ledger in hook:👇');
  console.dir(ledger, { depth: null });

  useEffect(() => {
    if (!ledger) {
      setAddress(null);

      return;
    }

    console.log('3: useGenericLedger- useEffect - setIsLoading(true)');

    setIsLoading(true);
    setError(null);
    setWarning(null);

    if (isFetching.current) {
      return;
    }

    isFetching.current = true;
    console.log('3-1: useGenericLedger - 🧲 ledger.getAddress ... accountIndex, addressOffset:', accountIndex, addressOffset);

    ledger.getAddress(false, accountIndex, addressOffset)
      .then((res) => {
        console.log('3-2: useGenericLedger - ledger.getAddress,  res:', res);

        setIsLoading(false);
        setAddress(res.address);
      }).catch((e: Error) => {
        setIsLoading(false);

        console.log('3-3: useGenericLedger - ledger.getAddress,  Error:', e);

        const warningMessage = e.message.includes('Code: 26628')
          ? t('Is your ledger locked?')
          : null;

        const errorMessage = e.message.includes('App does not seem to be open')
          ? t('App does not seem to be open')
          : e.message;

        setIsLocked(true);
        setWarning(warningMessage);
        setError(t(
          'Ledger error: {{errorMessage}}',
          { replace: { errorMessage } }
        ));
        console.error(e);
        setAddress(null);
      }).finally(() => {
        isFetching.current = false;
      });
    // If the dependency array is exhaustive, with t, the translation function, it
    // triggers a useless re-render when ledger device is connected.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountIndex, addressOffset, ledger]);

  const refresh = useCallback(() => {
    console.log('7: useGenericLedger - refresh ...');

    setRefreshLock(true);
    setError(null);
    setWarning(null);
  }, []);

  return ({ ...getState(), address, error, isLoading, isLocked, ledger, refresh, warning });
}
