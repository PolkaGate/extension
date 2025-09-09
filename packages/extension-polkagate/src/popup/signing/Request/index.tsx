// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, RequestSign } from '@polkadot/extension-base/background/types';
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
  isFirst: boolean;
  onSignature: ({ signature }: { signature: HexString; }) => void;
  payload: ExtrinsicPayload | null;
  request: RequestSign;
  setMode: React.Dispatch<React.SetStateAction<ModeData>>;
  signId: string;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  url: string;
}

function Request ({ account, error, hexBytes, isFirst, onSignature, payload, request, setError, setMode, signId, url }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { isExternal, isHardware, isQR } = account;
  const signerPayload = request.payload as SignerPayloadJSON;

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
              onSignature={onSignature}
              payload={payload}
            />)
          : (
            <Extrinsic
              onCancel={onCancel}
              payload={payload}
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
        isFirst={isFirst}
        request={request}
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
