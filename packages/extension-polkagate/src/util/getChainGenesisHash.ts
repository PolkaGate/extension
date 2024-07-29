// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import allChains from './chains';
import { sanitizeChainName } from './utils';

/**
 * @description get a chain genesis hash by its name
 * @param chainName
 * @returns sanitized chain name
 */
export default function getChainGenesisHash(chainName: string | undefined): string | undefined {
  if (!chainName) {
    return undefined;
  }

  const genesisHash = allChains.find(({ chain }) => chain === chainName || sanitizeChainName(chain) === chainName)?.genesisHash;

  return genesisHash;
}
