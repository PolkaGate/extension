// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteConfig } from './RouteDefinitions';

import AddWatchOnlyFullScreen from '@polkadot/extension-polkagate/src/popup/import/addWatchOnlyFullScreen';
import AttachQR from '@polkadot/extension-polkagate/src/popup/import/attachQR';
import AttachQrFullScreen from '@polkadot/extension-polkagate/src/popup/import/attachQrFullScreen';
import ImportProxied from '@polkadot/extension-polkagate/src/popup/import/importProxied';
import ImportProxiedFullScreen from '@polkadot/extension-polkagate/src/popup/import/importProxiedFullScreen';

export const IMPORT_ROUTES: RouteConfig[] = [
  {
    Component: AddWatchOnlyFullScreen,
    path: '/import/add-watch-only-full-screen',
    trigger: 'import-add-watch-only-full-screen'
  },
  {
    Component: AttachQR,
    path: '/import/attach-qr',
    trigger: 'attach-qr'
  },
  {
    Component: AttachQrFullScreen,
    path: '/import/attach-qr-full-screen',
    trigger: 'attach-qr-full-screen'
  },
  {
    Component: ImportProxied,
    path: '/import/proxied',
    trigger: 'import-proxied'
  },
  {
    Component: ImportProxiedFullScreen,
    path: '/import/proxied-full-screen',
    trigger: 'import-proxied-full-screen'
  }
];
