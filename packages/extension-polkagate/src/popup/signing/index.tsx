// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SigningRequest } from '@polkadot/extension-base/background/types';
import type { ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { ChevronRight } from '@mui/icons-material';
import { Container, IconButton, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/components/DraggableModal';
import { useIsExtensionPopup } from '@polkadot/extension-polkagate/src/hooks';
import { TypeRegistry } from '@polkadot/types';

import { Loading, Motion, SigningReqContext } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { approveSignSignature, cancelSignRequest } from '../../messaging';
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

interface ContentProps {
  mode: ModeData;
  onNextClick: () => void;
  onPreviousClick: () => void;
  requestIndex: number;
  request: SigningRequest;
  requests: SigningRequest[];
  error: string | null;
  hexBytes: string | null;
  payload: ExtrinsicPayload | null;
  setMode: React.Dispatch<React.SetStateAction<ModeData>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  onSignature: ({ signature }: { signature: HexString }) => void;
}

function Content ({ error, hexBytes, mode, onNextClick, onPreviousClick, onSignature, payload, request, requestIndex, requests, setError, setMode }: ContentProps): React.ReactElement {
  if (mode.type === SIGN_POPUP_MODE.DETAIL) {
    return (
      <ExtrinsicDetail
        mode={mode}
        request={request.request}
        setMode={setMode}
      />
    );
  }

  return (
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
          setError={setError}
          setMode={setMode}
          signId={request.id}
          signingRequest={request}
          url={request.url}
        />
      }
    </>
  );
}

interface WrapperProps extends ContentProps {
  onBack: () => void;
  onCancel: () => void;
}

function Wrapper ({ onBack, onCancel, ...content }: WrapperProps): React.ReactElement {
  const isExtension = useIsExtensionPopup();

  if (isExtension) {
    return (
      <Container disableGutters sx={{ p: '15px', position: 'relative' }}>
        <Typography color='text.primary' sx={{ display: 'block', pb: '15px', textAlign: 'center', textTransform: 'uppercase', width: '100%' }} variant='H-3'>
          {content.mode.title}
        </Typography>
        <Motion style={{ display: 'block', minHeight: '515px', position: 'relative' }} variant='fade'>
          <Content {...content} />
        </Motion>
      </Container>
    );
  }

  const isSigning = content.mode.type === SIGN_POPUP_MODE.SIGN;

  return (
    <DraggableModal
      RightItem={content.mode.type === SIGN_POPUP_MODE.DETAIL ? <Next onClick={onBack} /> : undefined}
      onClose={isSigning ? onBack : onCancel}
      open
      showBackIconAsClose={isSigning}
      style={{ minHeight: '550px', padding: '10px', position: 'relative', width: 360 }}
      title={content.mode.title}
    >
      <Content {...content} />
    </DraggableModal>
  );
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

  const [requestIndex, setRequestIndex] = useState<number>(0);
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

  const request = useMemo(() => (
    requests.length !== 0
      ? requestIndex >= 0
        ? requestIndex < requests.length
          ? requests[requestIndex]
          : requests[requests.length - 1]
        : requests[0]
      : null), [requestIndex, requests]);

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
    ? <Wrapper
      error={error}
      hexBytes={hexBytes}
      mode={mode}
      onBack={onBack}
      onCancel={onCancel}
      onNextClick={onNextClick}
      onPreviousClick={onPreviousClick}
      onSignature={onSignature}
      payload={payload}
      request={request}
      requestIndex={requestIndex}
      requests={requests}
      setError={setError}
      setMode={setMode}
      />
    : <Loading />;
}
