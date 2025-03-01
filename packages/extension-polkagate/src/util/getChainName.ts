// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from './types';

import { toCamelCase } from '../fullscreen/governance/utils/util';
import allChains from './chains';
import { sanitizeChainName } from './utils';

/**
 * @description get a chain name by its genesisHash
 * @param _genesisHash
 * @returns sanitized chain name
 */
export default function getChainName(_genesisHash: string | undefined, genesisOptions?: DropdownOption[]): string | undefined {
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
