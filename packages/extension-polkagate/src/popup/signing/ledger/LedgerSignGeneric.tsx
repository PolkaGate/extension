// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { LedgerSignature } from '@polkadot/hw-ledger/types';
import type { GenericExtrinsicPayload } from '@polkadot/types';
import type { SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useChainInfo, useGenericLedger, useMetadataProof } from '../../../hooks';
import { POLKADOT_SLIP44 } from '../../../util/constants';
import ledgerChains from '../../../util/legerChains';
import LedgerButtons from './LedgerButtons';

interface Props {
  account: AccountJson;
  disabled?: boolean;
  error: string | null | undefined;
  onSignature?: (signature: HexString, raw?: GenericExtrinsicPayload) => void;
  payload?: SignerPayloadJSON;
  setError: (value: string | null) => void;
  onCancel: () => void;
  style?: React.CSSProperties;
}

function LedgerSignGeneric({ account, disabled, error, onCancel, onSignature, payload, setError, style }: Props): React.ReactElement<Props> {
  const { accountIndex, addressOffset, isGeneric } = account;
  const payloadGenesis = payload?.genesisHash;
  const { api } = useChainInfo(payloadGenesis);
  const metadataProof = useMetadataProof(api, payload);

  const [isBusy, setIsBusy] = useState<boolean>(false);

  const chainSlip44 = useMemo(() => {
    if (isGeneric) {
      return POLKADOT_SLIP44;
    }

    if (payloadGenesis) {
      const ledgerChain = ledgerChains.find(({ genesisHash }) => genesisHash.includes(payloadGenesis));

      return ledgerChain?.slip44 ?? null;
    }

    return null;
  }, [isGeneric, payloadGenesis]);

  const { error: ledgerError, isLoading: ledgerLoading, isLocked: ledgerLocked, ledger, refresh, warning: ledgerWarning } = useGenericLedger(accountIndex, addressOffset, chainSlip44);

  useEffect(() => {
    if (ledgerError) {
      setError(ledgerError);
    }
  }, [ledgerError, setError]);

  const onRefresh = useCallback(() => {
    setIsBusy(true);
    refresh();
    setError(null);
    setTimeout(() => setIsBusy(false), 1000);
  }, [refresh, setError]);

  const onSignLedger = useCallback(() => {
    if (!ledger || !payload || !onSignature || !api || !metadataProof) {
      console.log('LedgerSignGeneric prerequisites:', {
        api: !!api,
        ledger: !!ledger,
        metadataProof: !!metadataProof,
        onSignature: !!onSignature,
        payload: !!payload
      });

      return;
    }

    const { raw, txMetadata } = metadataProof;

    setError(null);
    setIsBusy(true);

    ledger.signTransaction(raw.toU8a(true), txMetadata, accountIndex, addressOffset)
      .then(({ signature }: LedgerSignature) => {
        onSignature(signature, raw);
      })
      .catch((e: Error) => {
        setError(e.message);
        setIsBusy(false);
      });
  }, [ledger, payload, onSignature, api, metadataProof, setError, accountIndex, addressOffset]);

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
      style={style}
    />
  );
}

export default React.memo(LedgerSignGeneric);
