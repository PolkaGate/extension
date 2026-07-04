// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import useIsExtensionPopup from './useIsExtensionPopup';
import useIsSidePanel from './useIsSidePanel';

export default function useUiMode(): {
  isExtension: boolean,
  isSidePanel: boolean,
  isFullscreen: boolean
} {
  const isExtension = useIsExtensionPopup();
  const isSidePanel = useIsSidePanel();

  if (isExtension || isSidePanel) {
    return {
      isExtension,
      isFullscreen: false,
      isSidePanel
    };
  }

  return {
    isExtension,
    isFullscreen: true,
    isSidePanel
  };
}
