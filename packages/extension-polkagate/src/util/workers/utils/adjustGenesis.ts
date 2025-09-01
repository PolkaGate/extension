// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PASEO_GENESIS, WESTEND_GENESIS } from '@polkagate/apps-config';

import { NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB, PASEO_ASSET_HUB_GENESIS_HASH, PASEO_PEOPLE_GENESIS_HASH, WESTEND_GENESIS_HASH, WESTEND_PEOPLE_GENESIS_HASH, WESTMINT_GENESIS_HASH } from '../../constants';

export const relayToSystemChains = {
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

type SystemChainsName = 'hub' | 'people' | 'assetHub';

type RelayToSystemChainsType = Record<string, {
  [K in SystemChainsName]?: string;
}>;

/** Adjusts the provided genesis hash to its corresponding system chain genesis hash if applicable.
 * @param genesisHash - The original genesis hash of the chain.
 * @param type - The type of system chain to map to ('hub', 'people', or 'assetHub'). Defaults to 'hub'.
 * @returns The adjusted genesis hash if a mapping exists; otherwise, returns the original genesis hash.
 */
export function mapRelayToSystemGenesis (genesisHash: string | null | undefined, type: SystemChainsName = 'hub'): string | undefined {
  if (!genesisHash) {
    return;
  }

  const chains = relayToSystemChains as RelayToSystemChainsType;

  return chains[genesisHash]?.[type] ?? genesisHash;
}

/** Maps a hub genesis hash to its corresponding relay chain genesis hash if applicable.
 * @param genesisHash - The original genesis hash of the hub chain.
 * @returns The relay chain genesis hash if a mapping exists; otherwise, returns the original genesis hash.
 */
export function mapHubToRelay (genesisHash: string | undefined): string | undefined {
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
 * @param genesisHash - The genesis hash to check.
 * @returns True if the genesis hash has a mapping in hubToRelay; otherwise, false.
 */
export function isMigratedHub (genesisHash: string | undefined): boolean {
  return !!(genesisHash && (hubToRelay as Record<string, string>)?.[genesisHash]);
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
