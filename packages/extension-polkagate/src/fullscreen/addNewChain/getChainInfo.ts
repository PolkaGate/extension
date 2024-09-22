// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { LinkOption } from '@polkagate/apps-config/endpoints/types';
import type { ApiPromise } from '@polkadot/api';
import type { MetadataDef } from '@polkadot/extension-inject/types';

import { createWsEndpoints, getSystemIcon } from '@polkagate/apps-config';

import { TypeRegistry } from '@polkadot/types/create';
import { getSpecTypes } from '@polkadot/types-known';
import { formatBalance, isNumber } from '@polkadot/util';
import { base64Encode } from '@polkadot/util-crypto';
import { defaults as addressDefaults } from '@polkadot/util-crypto/address/defaults';

const endpoints = createWsEndpoints((k, v) => v?.toString() || k);

/**
 * Get all api endpoint info using api url.
 *
 * @param apiUrl - An url of an endpoint.
 * @returns The linkOption related to the url.
 */
export function getApiEndpoint (apiUrl?: string): LinkOption | null {
  return endpoints.find(({ value }) => value === apiUrl) || null;
}

interface Statics {
  api: ApiPromise;
  registry: TypeRegistry;
}

// NOTE We are assuming that the Api class _will_ set it correctly
export const statics = {
  api: undefined,
  registry: new TypeRegistry()
} as unknown as Statics;

export const DEFAULT_DECIMALS = statics.registry.createType('u32', 12);
export const DEFAULT_SS58 = statics.registry.createType(
  'u32',
  addressDefaults.prefix
);
export type ChainType = 'substrate' | 'ethereum';

export type ChainInfo = {
  color: string | undefined;
  price?: number | null;
  chainType: ChainType;
} & MetadataDef;

/**
 * Retrieves information about the connected chain, including metadata properties
 * and additional chain-specific details.
 *
 * @param api - The connected `ApiPromise` instance representing a remote node.
 * @returns A promise that resolves to a `ChainInfo` object or `null` if the API is not ready.
 */
export default async function getChainInfo (
  api: ApiPromise
): Promise<ChainInfo | null> {
  const isApiReady = await api.isReady;
  // FIXME: api._options?.provider?.endpoint returns undefined !
  // @ts-ignore
  const apiEndpoint = getApiEndpoint(api._options?.provider?.endpoint);
  const isEthereum = false;
  const specName = api.runtimeVersion.specName.toString();
  const systemChain = (await api.rpc.system.chain()).toString();
  const systemName = (await api.rpc.system.name()).toString();

  return isApiReady
    ? {
      chain: systemChain,
      chainType: isEthereum ? 'ethereum' : 'substrate',
      color: apiEndpoint?.ui.color,
      genesisHash: api.genesisHash.toHex(),
      icon: getSystemIcon(systemName, specName),
      metaCalls: base64Encode(api.runtimeMetadata.asCallsOnly.toU8a()),
      specVersion: api.runtimeVersion.specVersion.toNumber(),
      ss58Format: isNumber(api.registry.chainSS58)
        ? api.registry.chainSS58
        : DEFAULT_SS58.toNumber(),
      tokenDecimals: (api.registry.chainDecimals || [
        DEFAULT_DECIMALS.toNumber()
      ])[0],
      tokenSymbol: (api.registry.chainTokens ||
        formatBalance.getDefaults().unit)[0],
      types: getSpecTypes(
        api.registry,
        systemChain,
        api.runtimeVersion.specName,
        api.runtimeVersion.specVersion
      ) as unknown as Record<string, string>
    }
    : null;
}
