// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import { BN_ZERO } from '@polkadot/util';

import { fastestEndpoint, getChainEndpoints, metadataFromApi } from '../utils';
import { getPooledBalance } from './getPooledBalance.js';

export async function getBalances (chainName, addresses, userAddedEndpoints) {
  const chainEndpoints = getChainEndpoints(chainName, userAddedEndpoints);
  const { api, connections } = await fastestEndpoint(chainEndpoints);

  if (api.isConnected && api.derive.balances) {
    const { metadata } = metadataFromApi(api);

    postMessage(JSON.stringify({ functionName: 'getAssetOnRelayChain', metadata }));

    const requests = addresses.map(async (address) => {
      const balances = await api.derive.balances.all(address);
      const systemBalance = await api.query.system.account(address);

      balances.frozenBalance = systemBalance.frozen;

      let soloTotal = BN_ZERO;
      let pooledBalance = BN_ZERO;

      if (api.query.nominationPools) {
        pooledBalance = await getPooledBalance(api, address);
      }

      if (api.query.staking?.ledger) {
        const ledger = await api.query.staking.ledger(address);

        if (ledger.isSome) {
          soloTotal = ledger?.unwrap()?.total?.toString();
        }
      }

      return { address, balances, pooledBalance, soloTotal };
    });

    return { api, balanceInfo: await Promise.all(requests), connectionsToBeClosed: connections };
  }
}
