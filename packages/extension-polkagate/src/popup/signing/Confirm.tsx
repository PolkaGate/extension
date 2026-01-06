// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SigningRequest } from '@polkadot/extension-base/background/types';
import type { GenericExtrinsicPayload } from '@polkadot/types';
import type { Balance, ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FormatPrice } from '@polkadot/extension-polkagate/src/components';
import { useChainInfo, useTokenPrice, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { amountToHuman } from '@polkadot/extension-polkagate/src/util';

import { approveSignSignature } from '../../messaging';
import LedgerSign from './ledger/LedgerSign';
import LedgerSignGeneric from './ledger/LedgerSignGeneric';
import SignWithPassword from './Request/SignWithPassword';

function FeeRow({ fee, genesisHash }: { fee: Balance | undefined, genesisHash: string }) {
  const { t } = useTranslation();
  const { decimal } = useChainInfo(genesisHash);
  const { price } = useTokenPrice(genesisHash);

  return (
    <Grid alignItems='center' container item justifyContent='space-between' sx={{ '&::after': { background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', bottom: 0, content: '""', height: '1px', left: 0, position: 'absolute', width: '100%' }, p: '10px', position: 'relative' }}>
      <Typography color='#AA83DC' variant='B-1'>
        {t('Estimated Fee')}
      </Typography>
      <Stack alignItems='center' columnGap='5px' direction='row' lineHeight='normal'>
        <FormatPrice
          commify
          decimalColor='#EAEBF1'
          decimalPoint={4}
          fontFamily='Inter'
          fontSize='13px'
          fontWeight={500}
          num={fee ? amountToHuman(fee?.muln(price ?? 0), decimal) : undefined}
          skeletonHeight={21}
          textColor='#EAEBF1'
        />
        <Typography color='#AA83DC' variant='B-1'>
          {fee?.toHuman()}
        </Typography>
      </Stack>
    </Grid>
  );
}

interface Props {
  onCancel: () => void;
  fee?: Balance | undefined | null;
  request: SigningRequest;
  extrinsicPayload: ExtrinsicPayload;
  onSignature: ({ signature }: { signature: HexString; }) => void;
  signWithPasswordStyle?: React.CSSProperties;
}

export default function Confirm({ extrinsicPayload, fee, onCancel, onSignature, request, signWithPasswordStyle }: Props): React.ReactElement {
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
    <Grid container item sx={{ bottom: 0, display: 'block', height: '160px', position: 'absolute' }}>
      {fee !== null &&
        <FeeRow
          fee={fee}
          genesisHash={payload.genesisHash}
        />}
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
          isSignable
          onCancel={onCancel}
          setError={setError}
          signId={signId}
          style={signWithPasswordStyle}
        />
      }
    </Grid>
  );
}
