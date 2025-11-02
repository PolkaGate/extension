// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteConfig } from './RouteDefinitions';

import HistoryFs from '@polkadot/extension-polkagate/src/fullscreen/history';
import ManageProxies from '@polkadot/extension-polkagate/src/fullscreen/manageProxies';
import NFTAlbum from '@polkadot/extension-polkagate/src/fullscreen/nft';
import Send from '@polkadot/extension-polkagate/src/fullscreen/sendFund';
import Settings from '@polkadot/extension-polkagate/src/fullscreen/settings';
import History from '@polkadot/extension-polkagate/src/popup/history/newDesign';
import MigratePasswords from '@polkadot/extension-polkagate/src/popup/passwordManagement/MigratePasswords';

// NOTE: the rule for paths is /urlName/:address/:genesisHash/blah blah
export const FEATURE_ROUTES: RouteConfig[] = [
  {
    Component: ManageProxies,
    path: '/proxyManagement/:address/:genesisHash/',
    trigger: 'proxy-management'
  },
  {
    Component: History,
    path: '/history',
    trigger: 'history'
  },
  {
    Component: HistoryFs,
    path: '/historyfs',
    trigger: 'history-fullscreen'
  },
  {
    Component: NFTAlbum,
    path: '/nft/:address',
    trigger: 'nft-album'
  },
  {
    Component: Send,
    path: '/send/:address/:genesisHash/:assetId',
    trigger: 'send'
  },
  {
    Component: Settings,
    path: '/settingsfs/*'
  },
  {
    Component: MigratePasswords,
    path: '/migratePasswords'
  }
];
