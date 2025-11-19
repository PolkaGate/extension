// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { ChevronRight } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SharePopup } from '@polkadot/extension-polkagate/src/partials';
import { TypeRegistry } from '@polkadot/types';

import { Loading, SigningReqContext } from '../../components';
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

const Next = ({ onClick }: { onClick: () => void }) => {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        background: '#BFA1FF26',
        borderRadius: '10px',
        height: '36px',
        position: 'absolute',
        right: '5px',
        top: '-12px',
        width: '36px',
        zIndex: 2
      }}
    >
      <ChevronRight sx={{ color: '#AA83DC', fontSize: 20, stroke: '#AA83DC' }} />
    </IconButton>
  );
};

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

  const onNext = useCallback(() => {
    setMode((pre) => ({
      ...pre,
      title: t('Your Signature'),
      type: SIGN_POPUP_MODE.SIGN
    }));
  }, [setMode, t]);

  return request
    ? <SharePopup
      modalProps={{
        RightItem: mode.type === SIGN_POPUP_MODE.DETAIL ? <Next onClick={onNext} /> : undefined,
        showBackIconAsClose: [SIGN_POPUP_MODE.DETAIL, SIGN_POPUP_MODE.SIGN].includes(mode.type)
      }}
      modalStyle={{ minHeight: '550px', padding: '10px', position: 'relative', width: 360 }}
      onClose={[SIGN_POPUP_MODE.DETAIL, SIGN_POPUP_MODE.SIGN].includes(mode.type) ? onBack : onCancel}
      open
      popupProps={{
        TitleIcon: mode.Icon,
        iconSize: 24,
        maxHeight: 'calc(100% - 75px)',
        onBack: [SIGN_POPUP_MODE.DETAIL, SIGN_POPUP_MODE.SIGN].includes(mode.type) ? onBack : undefined,
        onNext: SIGN_POPUP_MODE.DETAIL === mode.type ? onNext : undefined,
        pt: 10,
        style: { '> div#container div#boxContainer': { height: 'calc(100% - 75px)' } },
        withoutTopBorder: true
      }}
      title={mode.title}
      >
      <>
        {mode.type === SIGN_POPUP_MODE.DETAIL &&
          <ExtrinsicDetail
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
            onCancel={onCancel}
            onSignature={onSignature}
            request={request}
          />
        }
      </>
    </SharePopup>
    : <Loading />;
}
