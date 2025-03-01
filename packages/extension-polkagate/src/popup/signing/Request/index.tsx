// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, RequestSign } from '@polkadot/extension-base/background/types';
import type { GenericExtrinsicPayload } from '@polkadot/types';
import type { ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { TypeRegistry } from '@polkadot/types';

import { ActionContext, Address, Warning } from '../../../components';
import { useAccount, useTranslation } from '../../../hooks';
import { approveSignSignature } from '../../../messaging';
import Bytes from '../Bytes';
import Extrinsic from '../Extrinsic';
import LedgerSign from '../LedgerSign';
import LedgerSignGeneric from '../LedgerSignGeneric';
import Qr from '../Qr';
import SignArea from './SignArea';

interface Props {
  account: AccountJson;
  buttonText: string;
  isFirst: boolean;
  request: RequestSign;
  signId: string;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  error: string | null;
  url: string;
}

interface Data {
  hexBytes: string | null;
  payload: ExtrinsicPayload | null;
}

export const CMD_MORTAL = 2;
export const CMD_SIGN_MESSAGE = 3;

// keep it global, we can and will re-use this across requests
const registry = new TypeRegistry();

function isRawPayload(payload: SignerPayloadJSON | SignerPayloadRaw): payload is SignerPayloadRaw {
  return !!(payload as SignerPayloadRaw).data;
}

export default function Request({ account: { accountIndex, addressOffset, isExternal, isHardware }, buttonText, error, isFirst, request, setError, signId, url }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const theme = useTheme();
  const account = useAccount(request.payload?.address);

  const onAction = useContext(ActionContext);
  const [{ hexBytes, payload }, setData] = useState<Data>({ hexBytes: null, payload: null });

  useEffect((): void => {
    const payload = request.payload;

    if (isRawPayload(payload)) {
      setData({
        hexBytes: payload.data,
        payload: null
      });
    } else {
      registry.setSignedExtensions(payload.signedExtensions);

      setData({
        hexBytes: null,
        payload: registry.createType('ExtrinsicPayload', payload, { version: payload.version })
      });
    }
  }, [request]);

  const _onSignature = useCallback(
    ({ signature }: { signature: HexString }): void => {
      approveSignSignature(signId, signature)
        .then(() => onAction('/'))
        .catch((error: Error): void => {
          setError(error.message);
          console.error(error);
        });
    },
    [onAction, setError, signId]
  );

  const onLedgerGenericSignature = useCallback((signature: HexString, _raw?: GenericExtrinsicPayload): void => {
    if (!_raw) {
      throw new Error('No extrinsic payload to sign!');
    }
    const _address = request.payload?.address

    const extrinsic = _raw.registry.createType(
      'Extrinsic',
      { method: _raw.method },
      { version: 4 }
    );

    extrinsic.addSignature(_address, signature, _raw.toHex());

    approveSignSignature(signId, signature, extrinsic.toHex())
      .then(() => onAction('/'))
      .catch((error: Error): void => {
        setError(error.message);
        console.error(error);
      });
  }, [request, onAction, setError, signId]);

  if (payload !== null) {
    const json = request.payload as SignerPayloadJSON;

    return (
      <>
        <div>
          <Address
            address={json.address}
            genesisHash={json.genesisHash}
            margin='15px auto'
          />
        </div>
        {isExternal && !isHardware
          ? <Qr
            address={json.address}
            cmd={CMD_MORTAL}
            genesisHash={json.genesisHash}
            onSignature={_onSignature}
            payload={payload}
          />
          : <Extrinsic
            payload={payload}
            request={json}
            url={url}
          />
        }
        {isHardware && account && (
          account?.isGeneric || account?.isMigration
            ? <LedgerSignGeneric
              accountIndex={accountIndex as number || 0}
              address={json.address}
              addressOffset={addressOffset as number || 0}
              error={error as string}
              onSignature={onLedgerGenericSignature}
              payload={request.payload as SignerPayloadJSON}
              setError={setError}
              showError={false}
            />
            : <LedgerSign
              accountIndex={accountIndex as number || 0}
              addressOffset={addressOffset as number || 0}
              error={error}
              genesisHash={json.genesisHash}
              onSignature={_onSignature}
              payload={payload}
              setError={setError}
            />
        )}
        {account &&
          <SignArea
            buttonText={buttonText}
            error={error}
            isExternal={isExternal}
            isFirst={isFirst}
            isSignable
            setError={setError}
            signId={signId}
          />
        }
      </>
    );
  } else if (hexBytes !== null) {
    const { address, data } = request.payload as SignerPayloadRaw;

    return (
      <>
        <div>
          <Address
            address={address}
          />
        </div>
        <Bytes
          bytes={data}
          url={url}
        />
        {(isHardware || isExternal) && (
          <>
            <Warning theme={theme}>{
              isHardware
                ? t('Raw data signing is not supported for hardware wallets.')
                : t('Raw data signing is not supported for QR wallets.')
            }</Warning>
          </>
        )}
        <SignArea
          buttonText={buttonText}
          error={error}
          isExternal={isExternal}
          isFirst={isFirst}
          isSignable={!isHardware && !isExternal}
          setError={setError}
          signId={signId}
        />
      </>
    );
  }

  return null;
}
