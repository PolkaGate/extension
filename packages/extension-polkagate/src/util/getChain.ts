// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from '@polkadot/networks/types';
import type { HexString } from '@polkadot/util/types';

import allChains from './chains';

interface ChainInfo {
  chain: string;
  genesisHash: HexString;
  decimal: number;
  icon: Icon;
  name: string;
  ss58Format: number;
  token: string;
}

/**
 * @description get a chain by its genesisHash
 * @param _genesisHash
 * @returns sanitized chain
 */
export default function getChain (_genesisHash: string | undefined): ChainInfo | undefined {
  if (!_genesisHash) {
    return undefined;
  }

  const found = allChains.find(({ genesisHash }) => genesisHash === _genesisHash);

  if (!found) {
    return undefined;
  }

  const { chain, tokenDecimal, tokenSymbol, ...rest } = found;

  return {
    ...rest,
    chain,
    decimal: tokenDecimal,
    name: chain,
    token: tokenSymbol
  };
}
