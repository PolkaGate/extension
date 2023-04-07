// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as Sc from '@substrate/connect';

import { ApiPromise } from '@polkadot/api';
import { ScProvider } from '@polkadot/rpc-provider/substrate-connect';

const extractChainName = (networkEndpoint: string | undefined): string | undefined => {
  if (!networkEndpoint) {
    return;
  }

  const firstSlash = networkEndpoint.indexOf('/');
  const secondSlash = networkEndpoint.indexOf('/', firstSlash + 1);
  const thirdSlash = networkEndpoint.indexOf('/', secondSlash + 1);
  const chainName = networkEndpoint.substring(thirdSlash + 1);
  const chainNameCapitalized = chainName.charAt(0).toUpperCase() + chainName.substring(1);

  return chainNameCapitalized;
};

const chainSpec = (networkName: string | undefined) => {
  switch (networkName) {
    case 'Polkadot':
      return Sc.WellKnownChain.polkadot;
      break;
    case 'Kusama':
      return Sc.WellKnownChain.ksmcc3;
      break;
    case 'Westend':
      return Sc.WellKnownChain.westend2;
      break;
    default:
      return '';
      break;
  }
};

export default async function LCConnector(endpoint: string | undefined): Promise<ApiPromise> {
  const chainName = extractChainName(endpoint);
  const currentChainSpec = chainSpec(chainName);

  try {
    console.log('connecting through light client');

    if (currentChainSpec.length) {
      const provider = new ScProvider(Sc, currentChainSpec);

      await provider.connect();

      return await ApiPromise.create({ provider });
    }

    return Promise.reject(Error);
  } catch (error) {
    console.error(error);
    console.log('fail');

    return Promise.reject(error);
  }
}
