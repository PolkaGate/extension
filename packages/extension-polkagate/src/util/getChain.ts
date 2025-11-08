// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import allChains, { type NetworkInfo } from './chains';

/**
 * @description get a chain by its genesisHash
 * @param _genesisHash
 * @returns sanitized chain
 */
export default function getChain (_genesisHash: string | undefined): NetworkInfo | undefined {
  if (!_genesisHash) {
    return undefined;
  }

  const found = allChains.find(({ genesisHash }) => genesisHash === _genesisHash);

  if (found) {
    found.name = found.chain;
  }

  return found;
}
