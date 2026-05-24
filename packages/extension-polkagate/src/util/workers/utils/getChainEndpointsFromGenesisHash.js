// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createWsEndpoints } from '@polkagate/apps-config';

/**
 * to get all available chain endpoints of a chain except light client
 * @param {string} genesisHash
 */

export function getChainEndpointsFromGenesisHash(genesisHash) {
  const allEndpoints = createWsEndpoints();

  return allEndpoints
    .filter((endpoint) => endpoint.genesisHash && endpoint.genesisHash === genesisHash && !endpoint.isDisabled && !endpoint?.isLightClient);
}
