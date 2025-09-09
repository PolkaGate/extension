// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SigningRequest } from '@polkadot/extension-base/background/types';
import type { GenericExtrinsicPayload } from '@polkadot/types';
import type { Balance, ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { Box, Grid } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { cubes } from '../../assets/icons';
import { approveSignSignature } from '../../messaging';
import LedgerSign from './ledger/LedgerSign';
import LedgerSignGeneric from './ledger/LedgerSignGeneric';
import SignWithPassword from './Request/SignWithPassword';

interface Props {
  onCancel: () => void;
  isFirst: boolean;
  fee?: Balance | undefined;
  request: SigningRequest;
  extrinsicPayload: ExtrinsicPayload;
  onSignature: ({ signature }: { signature: HexString; }) => void;
}

export default function Confirm ({ extrinsicPayload, fee, isFirst, onCancel, onSignature, request }: Props): React.ReactElement {
  const navigate = useNavigate();
  const { isExternal, isHardware } = request.account;

  const [error, setError] = useState<string | null>(null);

  const signId = request.id;
  const payload = request.request.payload as SignerPayloadJSON;
  const account = request.account;

  const onLedgerGenericSignature = useCallback((signature: HexString, _raw?: GenericExtrinsicPayload): void => {
    if (!_raw) {
      throw new Error('No extrinsic payload to sign!');
    }

    const address = payload?.address;

    const extrinsic = _raw.registry.createType(
      'Extrinsic',
      { method: _raw.method },
      { version: 4 }
    );

    extrinsic.addSignature(address, signature, _raw.toHex());

    approveSignSignature(signId, signature, extrinsic.toHex())
      .then(() => navigate('/'))
      .catch((error: Error): void => {
        setError(error.message);
        console.error(error);
      });
  }, [payload?.address, signId, navigate]);

  return (
    <Grid container display='block' height='440px' item zIndex={1}>
      <Box
        component='img'
        src={cubes as string}
        sx={{ height: 'auto', m: '30px auto 15px', width: '85.39px' }}
      />
      {isHardware && account && (
        account?.isGeneric || account?.isMigration
          ? (
            <LedgerSignGeneric
              account={request.account}
              error={error}
              onCancel={onCancel}
              onSignature={onLedgerGenericSignature}
              payload={payload}
              setError={setError}
            />)
          : (
            <LedgerSign
              account={request.account}
              error={error}
              genesisHash={payload.genesisHash}
              onCancel={onCancel}
              onSignature={onSignature}
              payload={extrinsicPayload}
              setError={setError}
            />)
      )}
      {account && !isExternal &&
        <SignWithPassword
          address={account.address}
          error={error}
          fee={fee}
          genesisHash={payload.genesisHash}
          isFirst={isFirst}
          isSignable
          onCancel={onCancel}
          setError={setError}
          signId={signId}
          withSavePassword
        />
      }
    </Grid>
  );
}
