// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as Sc from '@substrate/connect';

import { ApiPromise } from '@polkadot/api';
import { ScProvider } from '@polkadot/rpc-provider/substrate-connect';

const extractChainName = (networkEndpoint: string | undefined): string | undefined => {
  if (!networkEndpoint) {
    return;
  }

  const parts = networkEndpoint.split('/');
  const chainName = parts[3]; // Assuming the chain name is always at index 3
  const chainNameCapitalized = chainName.charAt(0).toUpperCase() + chainName.slice(1);

  return chainNameCapitalized;
};

const chainSpec = (networkName: string | undefined) => {
  switch (networkName) {
    case 'Polkadot':
      return Sc.WellKnownChain.polkadot;
    case 'Kusama':
      return Sc.WellKnownChain.ksmcc3;
    case 'Westend':
      return Sc.WellKnownChain.westend2;
    default:
      return '';
  }
};

export default async function LCConnector(endpoint: string): Promise<ApiPromise> {
  const chainName = extractChainName(endpoint);
  const currentChainSpec = chainSpec(chainName);

  try {
    console.log('connecting through light client, endpoint:', endpoint);

    if (currentChainSpec.length) {
      const provider = new ScProvider(Sc, currentChainSpec);

      await provider.connect();

      return await ApiPromise.create({ provider });
    }

    return Promise.reject(new Error(`Unsupported network: ${chainName}`));
  } catch (error) {
    return Promise.reject(error);
  }
}
