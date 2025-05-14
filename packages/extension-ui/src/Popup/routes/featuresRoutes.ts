// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteConfig } from './RouteDefinitions';

import AddNewChain from '@polkadot/extension-polkagate/src/fullscreen/addNewChain';
import Governance from '@polkadot/extension-polkagate/src/fullscreen/governance';
import ReferendumPost from '@polkadot/extension-polkagate/src/fullscreen/governance/post';
import HistoryFs from '@polkadot/extension-polkagate/src/fullscreen/history';
import ManageIdentity from '@polkadot/extension-polkagate/src/fullscreen/manageIdentity';
import FullScreenManageProxies from '@polkadot/extension-polkagate/src/fullscreen/manageProxies';
import NFTAlbum from '@polkadot/extension-polkagate/src/fullscreen/nft';
import Send from '@polkadot/extension-polkagate/src/fullscreen/sendFund';
import SocialRecovery from '@polkadot/extension-polkagate/src/fullscreen/socialRecovery';
import ManageValidatorsPoolfs from '@polkadot/extension-polkagate/src/fullscreen/stake/pool/commonTasks/manageValidators';
import ManageValidators from '@polkadot/extension-polkagate/src/fullscreen/stake/solo/commonTasks/manageValidators';
import AuthList from '@polkadot/extension-polkagate/src/popup/authManagement';
import CrowdLoans from '@polkadot/extension-polkagate/src/popup/crowdloans';
import History from '@polkadot/extension-polkagate/src/popup/history/newDesign';
import ManageProxies from '@polkadot/extension-polkagate/src/popup/manageProxies';

export const FEATURE_ROUTES: RouteConfig[] = [
  {
    Component: AddNewChain,
    path: '/addNewChain/',
    trigger: 'add-new-chain'
  },
  {
    Component: AuthList,
    path: '/auth-list/:id?',
    trigger: 'auth-list'
  },
  {
    Component: CrowdLoans,
    path: '/crowdloans/:address',
    trigger: 'crowdloans'
  },
  {
    Component: FullScreenManageProxies,
    path: '/fullscreenProxyManagement/:genesisHash/:address/',
    trigger: 'fullscreen-proxy-management'
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
    Component: ManageProxies,
    path: '/manageProxies/:address',
    trigger: 'manageProxies'
  },
  {
    Component: ManageIdentity,
    path: '/manageIdentity/:address',
    trigger: 'manage-identity'
  },
  {
    Component: ManageValidators,
    path: '/manageValidators/:address',
    trigger: 'manage-validators-fullscreen'
  },
  {
    Component: ManageValidatorsPoolfs,
    path: '/managePoolValidators/:address',
    trigger: 'manage-validators-fullscreen'
  },
  {
    Component: NFTAlbum,
    path: '/nft/:address',
    trigger: 'nft-album'
  },
  {
    Component: Send,
    path: '/send/:address/:assetId', // full-screen send page
    trigger: 'send'
  },
  {
    Component: SocialRecovery,
    path: '/socialRecovery/:address/:closeRecovery',
    trigger: 'social-recovery'
  }
];
