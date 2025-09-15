// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { KUSAMA_GENESIS, PASEO_GENESIS, POLKADOT_GENESIS, WESTEND_GENESIS } from '@polkagate/apps-config';

import { KUSAMA_PEOPLE_GENESIS_HASH, NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB, PASEO_ASSET_HUB_GENESIS_HASH, PASEO_PEOPLE_GENESIS_HASH, POLKADOT_PEOPLE_GENESIS_HASH, STAKING_CHAINS, STATEMINE_GENESIS_HASH, STATEMINT_GENESIS_HASH, WESTEND_GENESIS_HASH, WESTEND_PEOPLE_GENESIS_HASH, WESTMINT_GENESIS_HASH } from './constants';

export const relayToSystemChains = {
  [KUSAMA_GENESIS]: {
    hub: STATEMINE_GENESIS_HASH,
    people: KUSAMA_PEOPLE_GENESIS_HASH
  },
  [PASEO_GENESIS]: {
    hub: PASEO_ASSET_HUB_GENESIS_HASH,
    people: PASEO_PEOPLE_GENESIS_HASH
  },
  [POLKADOT_GENESIS]: {
    hub: STATEMINT_GENESIS_HASH,
    people: POLKADOT_PEOPLE_GENESIS_HASH
  },
  [WESTEND_GENESIS]: {
    hub: WESTMINT_GENESIS_HASH,
    people: WESTEND_PEOPLE_GENESIS_HASH
  }
};

export const migratedRelaysToSystemChains = {
  [PASEO_GENESIS]: {
    hub: PASEO_ASSET_HUB_GENESIS_HASH,
    people: PASEO_PEOPLE_GENESIS_HASH
  },
  [WESTEND_GENESIS]: {
    hub: WESTMINT_GENESIS_HASH,
    people: WESTEND_PEOPLE_GENESIS_HASH
  }
};

export const hubToRelay = {
  [PASEO_ASSET_HUB_GENESIS_HASH]: PASEO_GENESIS,
  [WESTMINT_GENESIS_HASH]: WESTEND_GENESIS_HASH
};

export const migratedRelays = [PASEO_GENESIS, WESTEND_GENESIS_HASH];
export const migratedRelayNames = ['paseo', 'westend'];

type SystemChainsName = 'hub' | 'people' | 'assetHub';

type RelayToSystemChainsType = Record<string, {
  [K in SystemChainsName]?: string;
}>;

/** Adjusts the provided genesis hash to its corresponding system chain genesis hash if applicable.
 * @param genesisHash - The original genesis hash of the chain.
 * @param type - The type of system chain to map to ('hub', 'people', or 'assetHub'). Defaults to 'hub'.
 * @returns The adjusted genesis hash if a mapping exists; otherwise, returns the original genesis hash.
 */
export function mapRelayToSystemGenesisIfMigrated (genesisHash: string | null | undefined, type: SystemChainsName = 'hub'): string | undefined {
  if (!genesisHash) {
    return;
  }

  const chains = migratedRelaysToSystemChains as RelayToSystemChainsType;

  return chains[genesisHash]?.[type] ?? genesisHash;
}

/** Maps a system chain genesis hash to its corresponding relay chain genesis hash if applicable.
 * Supports all system chain types defined in relayToSystemChains for future extensibility.
 * @param systemGenesisHash - The genesis hash of the system chain (e.g., hub, people, assetHub, etc).
 * @returns The relay chain genesis hash if a mapping exists; otherwise, returns the original genesis hash.
 */
export function mapSystemToRelay (systemGenesisHash: string | undefined | null, withMigrationCheck = true): string | undefined | null {
  if (!systemGenesisHash || (withMigrationCheck && !isMigratedHub(systemGenesisHash))) {
    return systemGenesisHash;
  }

  for (const [relayGenesis, systemChains] of Object.entries(relayToSystemChains)) {
    if (Object.values(systemChains).includes(systemGenesisHash)) {
      return relayGenesis;
    }
  }

  return systemGenesisHash;
}

/** Maps a hub genesis hash to its corresponding relay chain genesis hash if applicable.
 * @param genesisHash - The original genesis hash of the hub chain.
 * @returns The relay chain genesis hash if a mapping exists; otherwise, returns the original genesis hash.
 */
export function mapHubToRelay (genesisHash: string | undefined | null): string | undefined {
  if (!genesisHash) {
    return;
  }

  return (hubToRelay as Record<string, string>)?.[genesisHash] ?? genesisHash;
}

/** Checks if the provided genesis hash corresponds to a migrated relay chain.
 * @param genesisHash - The genesis hash to check.
 * @returns True if the genesis hash is in the list of migrated relays; otherwise, false.
 */
export function isMigratedRelay (genesisHash: string): boolean {
  return migratedRelays.includes(genesisHash);
}

/** Checks if the provided genesis hash corresponds to a migrated hub chain.
 * @param info - The genesis hash or hub chain name to check.
 * @returns True if the genesis hash has a mapping in hubToRelay; otherwise, false.
 */
export function isMigratedHub (info: string | undefined): boolean {
  return !!(info && (
    (hubToRelay as Record<string, string>)?.[info] ||
    migratedRelayNames.find((relayName) => info?.toLowerCase()?.includes(relayName))
  ));
}

export function isMigrated (genesisHash: string): boolean {
  return isMigratedRelay(genesisHash) || isMigratedHub(genesisHash);
}

/** Resolves the appropriate staking asset ID based on the provided genesis hash.
 * If the genesis hash corresponds to a migrated relay chain, it returns the asset ID for the
 * native token on AssetHub; otherwise, it returns the standard native token asset ID.
 * @param genesisHash - The genesis hash of the chain.
 * @returns The resolved staking asset ID, or undefined if the genesis hash is not provided.
 */
export function resolveStakingAssetId (genesisHash: string | undefined): string | undefined {
  if (!genesisHash) {
    return;
  }

  return isMigratedHub(genesisHash)
    ? `${NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB}`
    : `${NATIVE_TOKEN_ASSET_ID}`;
}

export function isStakingChain (genesisHash: string | undefined): boolean | undefined {
  if (!genesisHash) {
    return;
  }

  return STAKING_CHAINS.includes(genesisHash ?? '');
}

export function isSystemChain (systemChainGenesis: string | undefined, relayGenesis: string | undefined): boolean | undefined {
  if (!relayGenesis) {
    return;
  }

  const systemChains = relayToSystemChains[relayGenesis];

  if (!systemChains) {
    return;
  }

  return Object.values(systemChains).includes(systemChainGenesis ?? '');
}

export function extractRelayChainName (systemChainName: string | undefined): string | undefined {
  if (!systemChainName) {
    return;
  }

  return systemChainName
    .toLowerCase()
    .replace(/people/i, '')
    .replace(/assethub/i, '')
    .trim();
}
