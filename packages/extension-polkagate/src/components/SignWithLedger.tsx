// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types/submittable';
import type { GenericExtrinsicPayload } from '@polkadot/types';
import type { ISubmittableResult, SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { TxResult } from '../util/types';

import { Grid } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { useAccount } from '../hooks';
import LedgerSign from '../popup/signing/ledger/LedgerSign';
import LedgerSignGeneric from '../popup/signing/ledger/LedgerSignGeneric';
import { send } from '../util/api';
import { TRANSACTION_FLOW_STEPS, type TransactionFlowStep } from '../util/constants';

interface Props {
  address: string | undefined;
  api: ApiPromise | undefined;
  from: string | undefined;
  handleTxResult: (txResult: TxResult) => void
  onSecondaryClick: () => void;
  onSignature: ({ signature }: { signature: HexString; }) => Promise<void>;
  payload: GenericExtrinsicPayload | undefined;
  preparedTransaction: SubmittableExtrinsic<'promise', ISubmittableResult> | undefined;
  signerPayload: SignerPayloadJSON | undefined;
  setFlowStep: React.Dispatch<React.SetStateAction<TransactionFlowStep>>;
  style?: React.CSSProperties;
}

export default function SignWithLedger ({ address, api, from, handleTxResult, onSecondaryClick, onSignature, payload, preparedTransaction, setFlowStep, signerPayload, style }: Props) {
  const account = useAccount(address);

  const [error, setError] = useState<string | null>();

  const onLedgerGenericSignature = useCallback(async (signature: HexString, raw?: GenericExtrinsicPayload) => {
    if (!api || !signature || !preparedTransaction || !from) {
      return;
    }

    if (!raw) {
      throw new Error('No raw data to send!');
    }

    setFlowStep(TRANSACTION_FLOW_STEPS.WAIT_SCREEN);
    const txResult = await send(from, api, preparedTransaction, raw.toHex(), signature);

    setFlowStep(TRANSACTION_FLOW_STEPS.CONFIRMATION);

    handleTxResult(txResult);
  }, [api, from, handleTxResult, preparedTransaction, setFlowStep]);

  return (
    <Grid container item sx={{ width: '100%' }}>
      {
        account?.isGeneric || account?.isMigration
          ? <LedgerSignGeneric
            account={account}
            error={error}
            onCancel={onSecondaryClick}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSignature={onLedgerGenericSignature}
            payload={signerPayload}
            setError={setError}
            style={style}
          />
          : account &&
          <LedgerSign
            account={account}
            error={error}
            genesisHash={account?.genesisHash || api?.genesisHash?.toHex()}
            onCancel={onSecondaryClick} // TODO: should be fixed later
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSignature={onSignature}
            payload={payload}
            setError={setError}
          />
      }
    </Grid>
  );
}
