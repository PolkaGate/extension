// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteConfig } from './RouteDefinitions';

import Nft from '@polkadot/extension-polkagate/src/popup/nft';

export const NFT_ROUTES: RouteConfig[] = [
  {
    Component: Nft,
    path: '/nft-extension/:address/:index/',
    trigger: 'nft'
  }
];
