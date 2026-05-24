// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import uiSettings from '@polkadot/ui-settings';
import { assert } from '@polkadot/util';

import { POLKADOT_SLIP44 } from '../util/constants';
import { LEDGER_ERROR } from '../util/ledger/consts';
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
}

function getState(): StateBase {
  const isLedgerCapable = 'USB' in window;

  return {
    isLedgerCapable,
    isLedgerEnabled: isLedgerCapable && uiSettings.ledgerConn !== 'none'
  };
}

function retrieveLedger(chainSlip?: number | null): GenericLedger {
  const { isLedgerCapable } = getState();

  assert(isLedgerCapable, 'Incompatible browser, only Chrome is supported');

  return new GenericLedger(chainSlip || POLKADOT_SLIP44);
}

export function useGenericLedger(accountIndex = 0, addressOffset = 0, chainSlip?: number | null): State {
  const { t } = useTranslation();
  const isFetching = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [refreshLock, setRefreshLock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const ledger = useMemo(() => {
    setError(null);
    setIsLocked(false);
    setRefreshLock(false);

    try {
      return retrieveLedger(chainSlip);
    } catch (error) {
      setError((error as Error).message);
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshLock, chainSlip]);

  useEffect(() => {
    if (!ledger) {
      setAddress(null);

      return;
    }

    setIsLoading(true);
    setError(null);

    if (isFetching.current) {
      return;
    }

    isFetching.current = true;

    ledger.getAddress(false, accountIndex, addressOffset)
      .then((res) => {
        setIsLoading(false);
        setAddress(res.address);
      }).catch((e: Error) => {
        setIsLoading(false);

        const errorMessage = e.message.includes(LEDGER_ERROR.LOCKED)
          ? t('Ledger is locked')
          : e.message.includes(LEDGER_ERROR.OPEN_APP)
            ? t('Ledger app is not open')
            : e.message;

        setIsLocked(true);
        setError(errorMessage);
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
    setRefreshLock(true);
    setError(null);
  }, []);

  return ({ ...getState(), address, error, isLoading, isLocked, ledger, refresh });
}
