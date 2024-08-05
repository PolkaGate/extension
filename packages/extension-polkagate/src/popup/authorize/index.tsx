// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { useIsExtensionPopup } from '../../hooks';
import AuthExtensionMode from './AuthExtensionMode';
import AuthFullScreenMode from './AuthFullScreenMode';

export default function Authorize (): React.ReactElement {
  const isExtensionMode = useIsExtensionPopup();

  const extensionMode = window.location.pathname.includes('notification');

  return extensionMode || isExtensionMode
    ? <AuthExtensionMode />
    : <AuthFullScreenMode />;
}
