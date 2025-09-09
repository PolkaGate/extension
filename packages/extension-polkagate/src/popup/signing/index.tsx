// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TypeRegistry } from '@polkadot/types';

import { ExtensionPopup, Loading, SigningReqContext } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { approveSignSignature, cancelSignRequest } from '../../messaging';
import Confirm from './Confirm';
import ExtrinsicDetail from './ExtrinsicDetail';
import Request from './Request';
import TransactionIndex from './TransactionIndex';
import { type Data, type ModeData, SIGN_POPUP_MODE } from './types';

const registry = new TypeRegistry();

function isRawPayload (payload: SignerPayloadJSON | SignerPayloadRaw): payload is SignerPayloadRaw {
  return !!(payload as SignerPayloadRaw).data;
}

export default function Signing (): React.ReactElement {
  const { t } = useTranslation();
  const requests = useContext(SigningReqContext);
  const navigate = useNavigate();

  const DEFAULT_MODE_DATA: ModeData = useMemo(() => ({
    data: null,
    title: t('Approve Request'),
    type: SIGN_POPUP_MODE.REQUEST
  }), [t]);

  const [requestIndex, setRequestIndex] = useState(0);
  const [mode, setMode] = useState<ModeData>(DEFAULT_MODE_DATA);
  const [error, setError] = useState<string | null>(null);
  const [{ hexBytes, payload }, setData] = useState<Data>({ hexBytes: null, payload: null });

  const onNextClick = useCallback(() => setRequestIndex((requestIndex) => requestIndex + 1), []);
  const onPreviousClick = useCallback(() => setRequestIndex((requestIndex) => requestIndex - 1), []);

  useEffect(() => {
    setRequestIndex(
      (requestIndex) => requestIndex < requests.length
        ? requestIndex
        : requests.length - 1
    );
  }, [requests]);

  const request = requests.length !== 0
    ? requestIndex >= 0
      ? requestIndex < requests.length
        ? requests[requestIndex]
        : requests[requests.length - 1]
      : requests[0]
    : null;

  useEffect((): void => {
    if (!request) {
      return;
    }

    const payload = request.request.payload;

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

  const onCancel = useCallback((): void => {
    if (!request?.id) {
      return;
    }

    cancelSignRequest(request.id)
      .then(() => navigate('/'))
      .catch(console.error);
  }, [navigate, request?.id]);

  const onBack = useCallback((): void => {
    setMode(DEFAULT_MODE_DATA);
  }, [DEFAULT_MODE_DATA]);

  const onSignature = useCallback(({ signature }: { signature: HexString }): void => {
    request?.id && approveSignSignature(request.id, signature)
      .then(() => navigate('/'))
      .catch((e: Error): void => {
        setError(e.message);
        console.error(e);
      });
  }, [navigate, setError, request?.id]);

  return request
    ? <ExtensionPopup
      TitleIcon={mode.Icon}
      handleClose={onCancel}
      iconSize={24}
      maxHeight='calc(100% - 75px)'
      onBack={[SIGN_POPUP_MODE.DETAIL, SIGN_POPUP_MODE.SIGN].includes(mode.type) ? onBack : undefined}
      openMenu={true}
      pt={10}
      style={{ '> div#container div#boxContainer': { height: 'calc(100% - 75px)' } }}
      title={mode.title}
      withoutTopBorder
      >
      {mode.type === SIGN_POPUP_MODE.DETAIL &&
        <ExtrinsicDetail
          account={request.account}
          mode={mode}
          request={request.request}
        />
      }
      {[SIGN_POPUP_MODE.REQUEST, SIGN_POPUP_MODE.QR, SIGN_POPUP_MODE.RAW_DATA].includes(mode.type) &&
        <>
          {requests.length > 1 && (
            <TransactionIndex
              index={requestIndex}
              onNextClick={onNextClick}
              onPreviousClick={onPreviousClick}
              totalItems={requests.length}
            />
          )}
          {request.account &&
            <Request
              account={request.account}
              error={error}
              hexBytes={hexBytes}
              isFirst={requestIndex === 0}
              onSignature={onSignature}
              payload={payload}
              request={request.request}
              setError={setError}
              setMode={setMode}
              signId={request.id}
              url={request.url}
            />
          }
        </>
      }
      {mode.type === SIGN_POPUP_MODE.SIGN && payload &&
        <Confirm
          extrinsicPayload={payload}
          fee={mode.fee}
          isFirst={requestIndex === 0}
          onCancel={onCancel}
          onSignature={onSignature}
          request={request}
        />
      }
    </ExtensionPopup>
    : <Loading />;
}
