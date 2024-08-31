// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createWsEndpoints } from '@polkagate/apps-config';

import { getSpecTypes } from '@polkadot/types-known';
import { formatBalance, isNumber } from '@polkadot/util';
import { base64Encode } from '@polkadot/util-crypto';

/**
 * @param {import("@polkadot/api").ApiPromise} api
 */
export function getMetadata (api) {
  const endpoints = createWsEndpoints();

  const DEFAULT_DECIMALS = api.registry.createType('u32', 12);
  const DEFAULT_SS58 = api.registry.createType('u32', 42);
  const chainName = api.runtimeChain.toHuman();
  const chainGenesisHash = api.genesisHash.toHex();
  const color = endpoints.find(({ genesisHash, ui }) => genesisHash === chainGenesisHash && ui.color)?.ui.color;

  const metadata = {
    chain: chainName,
    chainType: 'substrate',
    color,
    genesisHash: chainGenesisHash,
    icon: 'substrate',
    metaCalls: base64Encode(api.runtimeMetadata.asCallsOnly.toU8a()),
    specVersion: api.runtimeVersion.specVersion.toNumber(),
    ss58Format: isNumber(api.registry.chainSS58)
      ? api.registry.chainSS58
      : DEFAULT_SS58.toNumber(),
    tokenDecimals: (api.registry.chainDecimals || [DEFAULT_DECIMALS.toNumber()])[0],
    tokenSymbol: (api.registry.chainTokens || formatBalance.getDefaults().unit)[0],
    types: getSpecTypes(api.registry, chainName, api.runtimeVersion.specName, api.runtimeVersion.specVersion)
  };

  return { metadata };
}
