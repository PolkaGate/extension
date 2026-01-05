// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import getChainName from '../../getChainName';
import { fastestEndpoint } from './fastestEndpoint';
import { getChainEndpoints } from './getChainEndpoints';

/**
 * @param {string | undefined} genesisHash
 */
export async function fastestApi(genesisHash) {
  const chainName = getChainName(genesisHash);
  const endpoints = getChainEndpoints(chainName ?? '');

  const { api, connections } = await fastestEndpoint(endpoints);

  return {
    api,
    connections
  };
}
