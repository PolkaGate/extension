// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { KUSAMA_GENESIS, PASEO_GENESIS, POLKADOT_GENESIS, WESTEND_GENESIS } from '@polkagate/apps-config';

import { KUSAMA_PEOPLE_GENESIS_HASH, NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB, PASEO_ASSET_HUB_GENESIS_HASH, PASEO_PEOPLE_GENESIS_HASH, POLKADOT_PEOPLE_GENESIS_HASH, RELAY_CHAINS_GENESISHASH, STAKING_CHAINS, STATEMINE_GENESIS_HASH, STATEMINT_GENESIS_HASH, WESTEND_PEOPLE_GENESIS_HASH, WESTMINT_GENESIS_HASH } from './constants';

/** These two lines need to be adapted on next migration for Polkadot */
export const migratedRelayNames = ['kusama', 'polkadot', 'paseo', 'westend'];
export const migratedRelays = [...RELAY_CHAINS_GENESISHASH];

type SystemChainsName = 'assetHub' | 'people';

type RelayToSystemChainsType = Record<string, {
  [K in SystemChainsName]?: string;
}>;

export const relayToSystemChains = {
  [KUSAMA_GENESIS]: {
    assetHub: STATEMINE_GENESIS_HASH,
    people: KUSAMA_PEOPLE_GENESIS_HASH
  },
  [PASEO_GENESIS]: {
    assetHub: PASEO_ASSET_HUB_GENESIS_HASH,
    people: PASEO_PEOPLE_GENESIS_HASH
  },
  [POLKADOT_GENESIS]: {
    assetHub: STATEMINT_GENESIS_HASH,
    people: POLKADOT_PEOPLE_GENESIS_HASH
  },
  [WESTEND_GENESIS]: {
    assetHub: WESTMINT_GENESIS_HASH,
    people: WESTEND_PEOPLE_GENESIS_HASH
  }
};

const migratedRelaysSet = new Set(migratedRelays);

export const migratedRelaysToSystemChains: RelayToSystemChainsType = Object.fromEntries(
  Object.entries(relayToSystemChains).filter(([relay]) =>
    migratedRelaysSet.has(relay)
  )
);

export const hubToRelay: Record<string, string> = Object.fromEntries(
  Object.entries(relayToSystemChains)
    .filter(([relay]) => migratedRelaysSet.has(relay))
    .map(([relay, systemChains]): [string, string] => [systemChains.assetHub, relay])
    .filter(([assetHub]) => !!assetHub)
);

/** Adjusts the provided genesis hash to its corresponding system chain genesis hash if applicable.
 * @param genesisHash - The original genesis hash of the chain.
 * @param type - The type of system chain to map to ( 'people', or 'assetHub'). Defaults to 'assetHub'.
 * @returns The adjusted genesis hash if a mapping exists; otherwise, returns the original genesis hash.
 */
export function mapRelayToSystemGenesisIfMigrated (genesisHash: string | null | undefined, type: SystemChainsName = 'assetHub'): string | undefined {
  if (!genesisHash) {
    return;
  }

  return migratedRelaysToSystemChains[genesisHash]?.[type] ?? genesisHash;
}

/**
 * Maps a system chain genesis hash to its corresponding relay chain genesis hash if applicable.
 * Supports all system chain types defined in relayToSystemChains for future extensibility.
 * @param systemGenesisHash - The genesis hash of the system chain (e.g., people, assetHub, etc).
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

/**
 * Maps a assetHub genesis hash to its corresponding relay chain genesis hash if applicable.
 * @param genesisHash - The original genesis hash of the assetHub chain.
 * @returns The relay chain genesis hash if a mapping exists; otherwise, returns the original genesis hash.
 */
export function mapHubToRelay (genesisHash: string | undefined | null): string | undefined {
  if (!genesisHash) {
    return;
  }

  return hubToRelay?.[genesisHash] ?? genesisHash;
}

/**
 * Checks if the provided genesis hash corresponds to a migrated relay chain.
 * @param genesisHash - The genesis hash to check.
 * @returns True if the genesis hash is in the list of migrated relays; otherwise, false.
 */
export function isMigratedRelay (genesisHash: string): boolean {
  return migratedRelaysSet.has(genesisHash);
}

/**
 * Checks if the provided genesis hash corresponds to a migrated assetHub chain.
 * @param info - The genesis hash or assetHub chain name to check.
 * @returns True if the genesis hash has a mapping in hubToRelay; otherwise, false.
 */
export function isMigratedHub (info: string | undefined): boolean {
  if (!info) {
    return false;
  }

  return !!(
    hubToRelay?.[info] || // check by genesishash
    isMigratedByChainName(info) // check by chain name
  );
}

/**
 * Determines whether the given chain genesis hash belongs to a migrated chain.
 * A chain is considered migrated if either:
 * - It is listed as a migrated relay chain (`isMigratedRelay`), or
 * - It corresponds to a migrated hub chain (`isMigratedHub`).
 * @param genesisHash - The genesis hash of the chain to check.
 * @returns `true` if the chain is migrated; otherwise `false`.
 */
export function isMigrated (genesisHash: string): boolean {
  return isMigratedRelay(genesisHash) || isMigratedHub(genesisHash);
}

/**
 * Checks if a chain is considered migrated based on its name.
 * @param name - The chain name of the chain to check.
 * @returns true for chains like "westend" and "westendAssetHub".
 */
export function isMigratedByChainName (name: string): boolean {
  const lcName = name.toLowerCase();

  // Check for "assethub" suffix: match if any migrated relay name is included
  if (lcName.includes('assethub')) {
    return migratedRelayNames.some((relayName) => lcName.includes(relayName));
  }

  // Exact match for non-assetHub chains
  return migratedRelayNames.some((relayName) => lcName === relayName);
}

/**
 * Resolves the appropriate staking asset ID based on the provided genesis hash.
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

/**
 * Checks if the given genesis hash belongs to a staking-enabled chain.
 * @param genesisHash - The genesis hash of the chain to check.
 * @returns `true` if the chain supports staking, otherwise `false`.
 */
export function isStakingChain (genesisHash: string | undefined): boolean | undefined {
  if (!genesisHash) {
    return;
  }

  return STAKING_CHAINS.includes(genesisHash);
}

/**
 * Determines whether a given system chain genesis hash belongs to a specific relay chain.
 * Looks up the relay's system chains from `relayToSystemChains` and checks if the
 * provided `systemChainGenesis` matches any of them (e.g., hub, people, assetHub).
 * @param systemChainGenesis - The genesis hash of the system chain to check.
 * @param relayGenesis - The genesis hash of the relay chain to check against.
 * @returns `true` if the system chain belongs to the given relay,`false` if it does not, or `undefined` if the relay genesis is not provided or not recognized.
 */
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

/**
 * Extracts the base relay chain name from a system chain name.
 * For example, "westendAssetHub" or "westendPeople" will return "westend".
 * Optionally, only performs extraction if the chain is considered migrated.
 *
 * @param systemChainName - The name of the system chain (e.g., "westendAssetHub").
 * @param withMigrationCheck - If true, extraction occurs only for chains identified as migrated.
 *                             If false or omitted, extraction is always performed.
 * @returns The normalized relay chain name, or the original name if not migrated (when migration check is applied),
 *          or `undefined` if `systemChainName` is not provided.
 */
export function extractRelayChainName (systemChainName: string | undefined, withMigrationCheck?: boolean): string | undefined {
  if (!systemChainName) {
    return;
  }

  if (withMigrationCheck && !isMigratedByChainName(systemChainName)) {
    return systemChainName;
  }

  return systemChainName
    .toLowerCase()
    .replace(/people/i, '')
    .replace(/assethub/i, '')
    .trim();
}
