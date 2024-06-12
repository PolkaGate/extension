// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import { createWsEndpoints } from '@polkagate/apps-config';

/** to get all available chain endpoints of a chain except light client */
export function getChainEndpoints (chainName) {
  const allEndpoints = createWsEndpoints();

  return allEndpoints
    .filter((endpoint) => endpoint.info && endpoint.info.toLowerCase() === chainName.toLowerCase() && !endpoint.isDisabled && !endpoint?.isLightClient);
}
