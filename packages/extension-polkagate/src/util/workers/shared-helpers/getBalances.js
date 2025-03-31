// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN_ZERO } from '@polkadot/util';

import { fastestEndpoint, getChainEndpoints, metadataFromApi } from '../utils';
import { getPooledBalance } from './getPooledBalance.js';

/**
 *
 * @param {string} chainName
 * @param {string[]} addresses
 * @param {import('../../types').UserAddedChains} userAddedEndpoints
 * @param {MessagePort } port
 * @returns
 */
export async function getBalances (chainName, addresses, userAddedEndpoints, port) {
  const chainEndpoints = getChainEndpoints(chainName, userAddedEndpoints);
  const { api, connections } = await fastestEndpoint(chainEndpoints);

  if (api.isConnected && api.derive.balances) {
    const { metadata } = metadataFromApi(api);

    console.info('Shared worker, metadata fetched and sent for chain:', chainName);
    port.postMessage(JSON.stringify({ functionName: 'getAssetOnRelayChain', metadata }));

    const requests = addresses.map(async (address) => {
      const balances = await api.derive.balances.all(address);
      const systemBalance = await api.query['system']['account'](address);

      // @ts-ignore
      balances.frozenBalance = systemBalance.data.frozen;

      let soloTotal = BN_ZERO;
      let pooledBalance = BN_ZERO;

      if (api.query['nominationPools']) {
        pooledBalance = await getPooledBalance(api, address);
      }

      if (api.query['staking']?.['ledger']) {
        const ledger = await api.query['staking']['ledger'](address);

        // @ts-ignore
        if (ledger.isSome) {
          // @ts-ignore
          soloTotal = ledger?.unwrap()?.total?.toString();
        }
      }

      return { address, balances, pooledBalance, soloTotal };
    });

    return { api, balanceInfo: await Promise.all(requests), connectionsToBeClosed: connections };
  }

  return undefined;
}
