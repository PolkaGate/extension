// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export default function useIsExtensionPopup(): boolean {
  if (chrome?.extension?.getViews) {
    const extensionViews = chrome.extension.getViews({ type: 'popup' });
    const isPopupOpenedByExtension = extensionViews.includes(window);

    if (isPopupOpenedByExtension) {
      return true;
    }
  }

  const isSmallWindow = window.innerWidth <= 357 && window.innerHeight <= 621;

  return isSmallWindow;
}
