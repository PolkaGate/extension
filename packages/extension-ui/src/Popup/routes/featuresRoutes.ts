// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteConfig } from './RouteDefinitions';

import Governance from '@polkadot/extension-polkagate/src/fullscreen/governance';
import ReferendumPost from '@polkadot/extension-polkagate/src/fullscreen/governance/post';
import HistoryFs from '@polkadot/extension-polkagate/src/fullscreen/history';
import ManageIdentity from '@polkadot/extension-polkagate/src/fullscreen/manageIdentity';
import ManageProxies from '@polkadot/extension-polkagate/src/fullscreen/manageProxies';
import NFTAlbum from '@polkadot/extension-polkagate/src/fullscreen/nft';
import Send from '@polkadot/extension-polkagate/src/fullscreen/sendFund';
import Settings from '@polkadot/extension-polkagate/src/fullscreen/settings';
import ManageValidatorsPoolfs from '@polkadot/extension-polkagate/src/fullscreen/stake/pool/commonTasks/manageValidators';
import AuthList from '@polkadot/extension-polkagate/src/popup/authManagement';
import History from '@polkadot/extension-polkagate/src/popup/history/newDesign';

// NOTE: the rule for paths is /urlName/:address/:genesisHash/blah blah
export const FEATURE_ROUTES: RouteConfig[] = [
  {
    Component: AuthList,
    path: '/auth-list/:id?',
    trigger: 'auth-list'
  },
  {
    Component: ManageProxies,
    path: '/proxyManagement/:address/:genesisHash/',
    trigger: 'proxy-management'
  },
  {
    Component: ReferendumPost,
    path: '/governance/:address/:topMenu/:postId',
    trigger: 'governance'
  },
  {
    Component: Governance,
    path: '/governance/:address/:topMenu',
    trigger: 'governance'
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
    Component: ManageIdentity,
    path: '/manageIdentity/:address',
    trigger: 'manage-identity'
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
];
