// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AuthorizeReqContext } from '../../components';
import { useIsExtensionPopup } from '../../hooks';
import AuthExtensionMode from './AuthExtensionMode';
import AuthFullScreenMode from './AuthFullScreenMode';

export default function Authorize(): React.ReactElement {
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

  return extensionMode || isExtensionMode
    ? <AuthExtensionMode
      onNextAuth={onNextAuth}
      onPreviousAuth={onPreviousAuth}
      requestIndex={requestIndex}
      requests={requests}
    />
    : <AuthFullScreenMode
      onNextAuth={onNextAuth}
      onPreviousAuth={onPreviousAuth}
      requestIndex={requestIndex}
      requests={requests}
    />;
}
