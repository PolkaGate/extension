// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ASSET_HUBS, RELAY_CHAINS_GENESISHASH } from './constants';
import { isMigratedByChainName, isMigratedHub } from './migrateHubUtils';

export const sanitizeChainName = (chainName: string | undefined, withMigration?: boolean) => {
  if (!chainName) {
    return chainName;
  }

  let sanitizedChainName = chainName
    .replace(' Relay Chain', '')
    .replace(' Network', '')
    .replace(' chain', '')
    .replace(' Chain', '')
    .replace(' Finance', '')
    .replace(' Testnet', '')
    .replace(' Mainnet', '')
    .replace(/\s/g, '');

  sanitizedChainName = withMigration && isMigratedHub(sanitizedChainName)
    ? sanitizedChainName.replace('AssetHub', '')
    : sanitizedChainName;

  return sanitizedChainName;
};

export const isOnRelayChain = (genesisHash?: string) => RELAY_CHAINS_GENESISHASH.includes(genesisHash || '');

export const isOnAssetHub = (genesisHash?: string) => ASSET_HUBS.includes(genesisHash || '');

export const getSubscanChainName = (chainName?: string): string | undefined => {
  if (!chainName) {
    return;
  }

  const lc = chainName.toLowerCase();

  if (lc.includes('assethub') || isMigratedByChainName(lc)) {
    // if already has 'assethub' at the end → reorder
    if (/(.*)assethub$/.test(lc)) {
      return lc.replace(/^(.*)assethub$/, 'assethub-$1');
    }

    // if it’s just the relay (westend, polkadot, paseo, etc.)
    return `assethub-${lc}`;
  }

  if (lc.includes('people')) {
    return lc.replace(/^(.*)people$/, 'people-$1');
  }

  if (lc === 'moonbasealpha') {
    return 'moonbase';
  }

  return lc;
};
