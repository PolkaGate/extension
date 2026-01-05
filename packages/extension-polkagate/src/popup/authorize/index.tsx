// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AuthorizeRequest } from '@polkadot/extension-base/background/types';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AuthorizeReqContext } from '../../components';
import { useIsExtensionPopup } from '../../hooks';
import { ConnectedDapp } from '../../partials';
import AuthFullScreenMode from './AuthFullScreenMode';

export interface AuthorizeRequestHandlerProp {
  currentIndex: number;
  request: AuthorizeRequest;
  onNext: () => void;
  onPrevious: () => void;
  hasBanner: boolean;
  totalRequests: number;
}

export default function Authorize (): React.ReactElement {
  const isExtensionMode = useIsExtensionPopup();
  const extensionMode = window.location.pathname.includes('notification');
  const requests = useContext(AuthorizeReqContext);

  const [requestIndex, setRequestIndex] = useState<number>(0);

  useEffect(() => {
    // reset index when the request size changes due to request approve or rejection
    setRequestIndex(0);
  }, [requests.length]);

  const onNextAuth = useCallback(() => {
    setRequestIndex((index) => index < requests.length - 1 ? index + 1 : 0);
  }, [requests.length]);

  const onPreviousAuth = useCallback(() => {
    setRequestIndex((index) => index > 0 ? index - 1 : requests.length - 1);
  }, [requests.length]);

  const authorizeRequestHandler: AuthorizeRequestHandlerProp = useMemo(() => ({
    currentIndex: requestIndex,
    hasBanner: requests.length > 1,
    onNext: onNextAuth,
    onPrevious: onPreviousAuth,
    request: requests[requestIndex],
    totalRequests: requests.length
  }), [onNextAuth, onPreviousAuth, requestIndex, requests]);

  return extensionMode || isExtensionMode
    ? <ConnectedDapp
      authorizeRequestHandler={authorizeRequestHandler}
    />
    : <AuthFullScreenMode
      authorizeRequestHandler={authorizeRequestHandler}
    />;
}
