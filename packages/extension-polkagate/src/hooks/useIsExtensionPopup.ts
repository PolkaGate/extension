// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

interface ChromeWithExtensionViews {
  extension?: {
    getViews?: (fetchProperties?: { type?: 'popup' }) => Window[];
  };
}

const getChrome = () => (globalThis as typeof globalThis & { chrome?: ChromeWithExtensionViews }).chrome;

export default function useIsExtensionPopup(): boolean {
  const isSidePanel = window.location.pathname.endsWith('/sidepanel.html');

  if (isSidePanel) {
    return true;
  }

  if (window.location.pathname.includes('notification')) {
    return true;
  }

  const chromeApi = getChrome();

  if (chromeApi?.extension?.getViews) {
    const extensionViews = chromeApi.extension.getViews({ type: 'popup' });
    const isPopupOpenedByExtension = extensionViews.includes(window);

    if (isPopupOpenedByExtension) {
      return true;
    }
  }

  const isSmallWindow = window.innerWidth <= 357 && window.innerHeight <= 621;

  return isSmallWindow;
}
