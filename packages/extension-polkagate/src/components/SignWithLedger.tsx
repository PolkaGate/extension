// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { TxResult } from '../util/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types/submittable';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { GenericExtrinsicPayload } from '@polkadot/types';

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { ApiPromise } from '@polkadot/api';
import { useAccount, useTranslation } from '../hooks';
import LedgerSign from '../popup/signing/LedgerSign';
import { send } from '../util/api';
import { PButton, Warning } from '.';
import LedgerSignGeneric from '../popup/signing/LedgerSignGeneric';

interface Props {
  address: string;
  alertText: string | undefined;
  onSecondaryClick: () => void;
  signerPayload: SignerPayloadJSON | undefined;
  onSignature: ({ signature }: { signature: HexString; }) => Promise<void>;
  api: ApiPromise | undefined;
  payload: GenericExtrinsicPayload | undefined;
  from: string | undefined;
  ptx: SubmittableExtrinsic<"promise", ISubmittableResult> | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  steps: Record<string, number>;
  handleTxResult: (txResult: TxResult) => void
}

export default function SignWithLedger({ address, alertText, api, from, handleTxResult, onSecondaryClick, signerPayload, onSignature, payload, ptx, setStep, steps }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const account = useAccount(address);

  const [error, setError] = useState<string | null>();

  const onLedgerGenericSignature = useCallback(async (signature: HexString, raw?: GenericExtrinsicPayload) => {
    if (!api || !signature || !ptx || !from) {
      return;
    }

    if (!raw) {
      throw new Error('No raw data to send!');
    }

    setStep(steps['WAIT_SCREEN']);

    const txResult = await send(from, api, ptx, raw.toHex(), signature);

    handleTxResult(txResult);
  }, [api, from, handleTxResult, ptx, setStep, steps['WAIT_SCREEN']]);

  return (
    <>
      <Grid alignItems='center' container height='50px' item justifyContent='center' sx={{ '> div': { m: 0, p: 0 }, pt: '5px' }}>
        <Warning
          isDanger={!!error}
          theme={theme}
        >
          {error || alertText}
        </Warning>
      </Grid>
      <Grid container item justifyContent='space-between'>
        <Grid item sx={{ mt: '18px' }} xs={3}>
          <PButton
            _mt='1px'
            _onClick={onSecondaryClick}
            _variant='outlined'
            text={t('Cancel')}
          />
        </Grid>
        <Grid item sx={{ 'button': { m: 0, width: '100%' }, mt: '80px', position: 'relative', width: '70%' }} xs={8}>
          {account?.isGeneric || account?.isMigration
            ? <LedgerSignGeneric
              accountIndex={account?.accountIndex as number || 0}
              address={address}
              addressOffset={account?.addressOffset as number || 0}
              error={error as string}
              onSignature={onLedgerGenericSignature}
              payload={signerPayload}
              setError={setError}
              showError={false}
            />
            : <LedgerSign
              accountIndex={account?.accountIndex as number || 0}
              addressOffset={account?.addressOffset as number || 0}
              error={error as string}
              genesisHash={account?.genesisHash || api?.genesisHash?.toHex()}
              onSignature={onSignature}
              payload={payload}
              setError={setError}
              showError={false}
            />
          }
        </Grid>
      </Grid>
    </>
  )
}
