// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN_ZERO } from '@polkadot/util';

import { FETCHING_ASSETS_FUNCTION_NAMES } from '../../constants';
import { fastestEndpoint, getChainEndpoints, metadataFromApi } from '../utils';
import { getStakingBalances } from './getStakingBalances';

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

    console.info(chainName, 'metadata : fetched and saved.');
    port.postMessage(JSON.stringify({ functionName: FETCHING_ASSETS_FUNCTION_NAMES.RELAY, metadata }));

    const requests = addresses.map(async (address) => {
      const allBalances = await api.derive.balances.all(address);
      const systemBalance = await api.query['system']['account'](address);
      const existentialDeposit = api.consts['balances']['existentialDeposit'];

      const balances = {
        ...allBalances,
        ED: existentialDeposit,
        // @ts-ignore
        frozenBalance: systemBalance.data.frozen
      };

      const { pooled, soloTotal } = await getStakingBalances(address, api);

      return {
        address,
        balances,
        claimPermissions: pooled?.claimPermissions ?? null,
        poolName: pooled?.poolName,
        poolReward: pooled?.poolReward ?? BN_ZERO,
        pooledBalance: pooled?.pooledBalance ?? BN_ZERO,
        soloTotal
      };
    });

    return { api,
      balanceInfo: await Promise.all(requests),
      connectionsToBeClosed: connections };
  }

  return undefined;
}
