// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';

import React, { useCallback, useEffect, useState } from 'react';

import { useLedger } from '../../../hooks/useLedger';
import LedgerButtons from './LedgerButtons';

interface Props {
  account: AccountJson;
  error: string | null | undefined;
  disabled?: boolean;
  genesisHash?: string;
  onCancel: () => void;
  onSignature?: ({ signature }: { signature: HexString }) => void;
  payload?: ExtrinsicPayload;
  setError: (value: string | null) => void;
}

function LedgerSign ({ account, disabled, error, genesisHash, onCancel, onSignature, payload, setError }: Props): React.ReactElement<Props> {
  const [isBusy, setIsBusy] = useState(false);
  const { accountIndex, addressOffset } = account;

  const { error: ledgerError, isLoading: ledgerLoading, isLocked: ledgerLocked, ledger, refresh, warning: ledgerWarning } = useLedger(genesisHash, accountIndex, addressOffset);

  useEffect(() => {
    if (ledgerError) {
      setError(ledgerError);
    }
  }, [ledgerError, setError]);

  const onRefresh = useCallback(() => {
    refresh();
    setError(null);
  }, [refresh, setError]);

  const onSignLedger = useCallback(
    (): void => {
      if (!ledger || !payload || !onSignature) {
        return;
      }

      setError(null);
      setIsBusy(true);
      ledger.sign(payload.toU8a(true), accountIndex, addressOffset)
        .then((signature) => {
          onSignature(signature);
        }).catch((e: Error) => {
          setError(e.message);
          setIsBusy(false);
        });
    },
    [accountIndex, addressOffset, ledger, onSignature, payload, setError]
  );

  return (
    <LedgerButtons
      disabled={disabled}
      error={error}
      isBusy={isBusy || ledgerLoading}
      ledgerLocked={ledgerLocked}
      ledgerWarning={ledgerWarning}
      onCancel={onCancel}
      onRefresh={onRefresh}
      onSignLedger={onSignLedger}
    />
  );
}

export default React.memo(LedgerSign);
