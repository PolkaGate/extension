// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AlchemyProvider, CloudflareProvider, FallbackProvider, InfuraProvider, JsonRpcProvider, type Networkish } from 'ethers';

const NETWORK_MAP: Record<string, string> = {
  ethereum: 'homestead',
  goreli: 'goerli',
  sepolia: 'sepolia'
};

const isTestNet = (chainName: string) => ['goreli', 'sepolia'].includes(chainName?.toLowerCase() ?? '');

export const getEthProvider = (chainName: string, asSigner?: boolean): JsonRpcProvider | FallbackProvider => {
  const lcChainName = chainName.toLowerCase();
  const network = NETWORK_MAP[lcChainName] as Networkish;

  if (!network) {
    throw new Error(`Unsupported network: ${chainName}`);
  }

  // For testnets, use direct JsonRpcProvider URLs
  if (isTestNet(chainName) || asSigner) {
    console.log(chainName, ' is a test net hence using JsonRpcProvider.');

    let rpcUrl;

    if (process.env['INFURA_PROJECT_ID']) {
      const name = lcChainName === 'ethereum' ? 'mainnet' : network;

      rpcUrl = `https://${name}.infura.io/v3/${process.env['INFURA_PROJECT_ID']}`;
    } else {
      throw new Error('INFURA_PROJECT_ID is required for Goerli testnet');
    }

    return new JsonRpcProvider(rpcUrl);
  }

  const providers = [];

  process.env['INFURA_PROJECT_ID'] && providers.push(new InfuraProvider(network, process.env['INFURA_PROJECT_ID']));
  process.env['ALCHEMY_API_KEY'] && providers.push(new AlchemyProvider(network, process.env['ALCHEMY_API_KEY']));
  network === 'homestead' && providers.push(new CloudflareProvider());

  if (providers.length === 0) {
    throw new Error('No EVM providers configured for ' + chainName);
  }

  return new FallbackProvider(providers, 1);
};
