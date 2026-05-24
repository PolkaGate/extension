// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from './types';

import { sanitizeChainName } from './chain';
import allChains from './chains';
import { toCamelCase } from '.';

/**
 * Returns a sanitized and camel-cased chain name for a given genesis hash.
 *
 * Looks up the chain name first in the main chain list (`allChains`),
 * and optionally in a list of dropdown options (`genesisOptions`) if not found.
 *
 * @param _genesisHash - The genesis hash of the chain to look up.
 * @param genesisOptions - Optional list of dropdown options to search if the chain is not in the main list.
 * @returns The sanitized and camel-cased chain name, or `undefined` if the genesis hash is missing.
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
