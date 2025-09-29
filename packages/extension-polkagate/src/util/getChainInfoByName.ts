// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { sanitizeChainName } from './chain';
import allChains, { type NetworkInfo } from './chains';

export default function getChainInfoByName (chainName: string | undefined): NetworkInfo | undefined {
  if (!chainName) {
    return undefined;
  }

  return allChains.find(({ chain }) => chain === chainName || sanitizeChainName(chain) === chainName);
}
