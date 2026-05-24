// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteConfig } from './RouteDefinitions';

import AddWatchOnlyFullScreen from '@polkadot/extension-polkagate/src/popup/import/addWatchOnlyFullScreen';
import AttachQrFullScreen from '@polkadot/extension-polkagate/src/popup/import/attachQrFullScreen';

export const IMPORT_ROUTES: RouteConfig[] = [
  {
    Component: AddWatchOnlyFullScreen,
    path: '/import/add-watch-only-full-screen',
    trigger: 'import-add-watch-only-full-screen'
  },
  {
    Component: AttachQrFullScreen,
    path: '/import/attach-qr-full-screen',
    trigger: 'attach-qr-full-screen'
  }
];
