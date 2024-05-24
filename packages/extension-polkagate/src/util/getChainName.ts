// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { toCamelCase } from '../fullscreen/governance/utils/util';
import allChains from './chains';
import { sanitizeChainName } from './utils';

/**
 * @description get a chain name by its genesisHash
 * @param _genesisHash
 * @returns sanitized chain name
 */
export default function getChainName (_genesisHash: string | undefined): string | undefined {
  if (!_genesisHash) {
    console.info('genesisHash should not be undefined');

    return undefined;
  }

  const chain = allChains.find(({ genesisHash }) => genesisHash === _genesisHash)?.chain;

  return toCamelCase(sanitizeChainName(chain) || '');
}
