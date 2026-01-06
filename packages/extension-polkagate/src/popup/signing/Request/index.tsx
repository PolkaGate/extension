// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, SigningRequest } from '@polkadot/extension-base/background/types';
import type { ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { ScanBarcode } from 'iconsax-react';
import React, { memo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from '../../../hooks';
import { cancelSignRequest } from '../../../messaging';
import { CMD_MORTAL, type ModeData, SIGN_POPUP_MODE } from '../types';
import Extrinsic from './Extrinsic';
import Qr from './Qr';
import RawData from './RawData';

interface Props {
  account: AccountJson;
  error: string | null;
  hexBytes: string | null;
  onSignature: ({ signature }: { signature: HexString; }) => void;
  payload: ExtrinsicPayload | null;
  signingRequest: SigningRequest;
  setMode: React.Dispatch<React.SetStateAction<ModeData>>;
  signId: string;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  url: string;
}

function Request({ account, error, hexBytes, onSignature, payload, setError, setMode, signId, signingRequest, url }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { isExternal, isHardware, isQR } = account;
  const signerPayload = signingRequest.request.payload as SignerPayloadJSON;

  const onCancel = useCallback((): void => {
    if (!signId) {
      return;
    }

    cancelSignRequest(signId)
      .then(() => navigate('/'))
      .catch((error: Error) => console.error(error));
  }, [navigate, signId]);

  useEffect(() => {
    isQR && setMode({
      Icon: ScanBarcode,
      title: t('Sign With QR-Code'),
      type: SIGN_POPUP_MODE.QR
    });
  }, [isQR, setMode, t]);

  if (payload !== null) {
    return (
      <>
        {isExternal && !isHardware
          ? (
            <Qr
              address={signerPayload.address}
              cmd={CMD_MORTAL}
              genesisHash={signerPayload.genesisHash}
              onCancel={onCancel}
              onSignature={onSignature}
              payload={payload}
            />)
          : (
            <Extrinsic
              onCancel={onCancel}
              onSignature={onSignature}
              payload={payload}
              request={signingRequest}
              setMode={setMode}
              signerPayload={signerPayload}
              url={url}
            />)
        }
      </>
    );
  }

  if (hexBytes !== null) {
    return (
      <RawData
        account={account}
        error={error}
        request={signingRequest.request}
        setError={setError}
        setMode={setMode}
        signId={signId}
        url={url}
      />
    );
  }

  return null;
}

export default memo(Request);
