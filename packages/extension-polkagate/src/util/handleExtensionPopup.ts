// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useState } from 'react';

import { ExtensionPopups } from './constants';

export type ExtensionPopupOpener = (popup: ExtensionPopups) => () => void;
export type ExtensionPopupCloser = () => void;

export function useExtensionPopups () {
  const [extensionPopup, setExtensionPopup] = useState<ExtensionPopups>(ExtensionPopups.NONE);

  const extensionPopupOpener: ExtensionPopupOpener = useCallback((popup: ExtensionPopups) => () => setExtensionPopup(popup), []);
  const extensionPopupCloser: ExtensionPopupCloser = useCallback(() => setExtensionPopup(ExtensionPopups.NONE), []);

  return { extensionPopup, extensionPopupCloser, extensionPopupOpener };
}
