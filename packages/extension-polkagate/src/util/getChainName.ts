// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from './types';

import { sanitizeChainName } from './chain';
import allChains from './chains';
import { toCamelCase } from '.';

/**
 * @description get a chain name by its genesisHash
 * @param _genesisHash
 * @returns sanitized chain name
 */
export default function getChainName (_genesisHash: string | undefined, genesisOptions?: DropdownOption[]): string | undefined {
  if (!_genesisHash) {
    console.info('genesisHash should not be undefined');

    return undefined;
  }

  let chainName = allChains.find(({ genesisHash }) => genesisHash === _genesisHash)?.chain;

  if (!chainName && genesisOptions) {
    chainName = genesisOptions.find(({ value }) => value === _genesisHash)?.text;
  }

  return toCamelCase(sanitizeChainName(chainName) || '');
}
