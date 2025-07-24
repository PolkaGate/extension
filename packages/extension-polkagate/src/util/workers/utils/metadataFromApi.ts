// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { MetadataDef } from '@polkadot/extension-inject/types';

import { createWsEndpoints, getSystemIcon } from '@polkagate/apps-config';

import { getSpecTypes } from '@polkadot/types-known';
import { formatBalance, isNumber } from '@polkadot/util';
import { base64Encode } from '@polkadot/util-crypto';

const endpoints = createWsEndpoints();

export function metadataFromApi(api: ApiPromise): { metadata: MetadataDef } {
  const DEFAULT_DECIMALS = api.registry.createType('u32', 12);
  const DEFAULT_SS58 = api.registry.createType('u32', 42);
  const chainName = api.runtimeChain.toHuman();
  const apiGenesisHash = api.genesisHash.toHex();
  const color = endpoints.find(({ genesisHash, ui }) => genesisHash === apiGenesisHash && ui.color)?.ui?.color;

  const metadata = {
    chain: chainName,
    chainType: 'substrate' as 'ethereum' | 'substrate',
    color,
    genesisHash: apiGenesisHash,
    icon: getSystemIcon(chainName, api.runtimeVersion.specName.toString()),
    metaCalls: base64Encode(api.runtimeMetadata.asCallsOnly.toU8a()),
    specVersion: api.runtimeVersion.specVersion.toNumber(),
    ss58Format: isNumber(api.registry.chainSS58)
      ? api.registry.chainSS58
      : DEFAULT_SS58.toNumber(),
    tokenDecimals: (api.registry.chainDecimals || [DEFAULT_DECIMALS.toNumber()])[0],
    tokenSymbol: (api.registry.chainTokens || formatBalance.getDefaults().unit)[0],
    types: getSpecTypes(api.registry, chainName, api.runtimeVersion.specName, api.runtimeVersion.specVersion) as Record<string, string | Record<string, string>>
  };

  return { metadata };
}
