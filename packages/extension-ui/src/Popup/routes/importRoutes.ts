// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteConfig } from './RouteDefinitions';

import AddWatchOnlyFullScreen from '@polkadot/extension-polkagate/src/popup/import/addWatchOnlyFullScreen';
import AttachQrFullScreen from '@polkadot/extension-polkagate/src/popup/import/attachQrFullScreen';
import ImportProxiedFullScreen from '@polkadot/extension-polkagate/src/popup/import/importProxiedFullScreen';

export const IMPORT_ROUTES: RouteConfig[] = [
  {
    Component: AddWatchOnlyFullScreen,
    path: '/import/add-watch-only-full-screen',
    trigger: 'import-add-watch-only-full-screen'
  },
  {
    Component: ImportProxiedFullScreen,
    path: '/import/proxied-full-screen',
    trigger: 'import-proxied-full-screen'
  },
  {
    Component: AttachQrFullScreen,
    path: '/import/attach-qr-full-screen',
    trigger: 'attach-qr-full-screen'
  }
];
