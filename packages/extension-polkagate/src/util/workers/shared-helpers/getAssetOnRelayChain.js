// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import { NATIVE_TOKEN_ASSET_ID, TEST_NETS } from '../../constants';
import { getPriceIdByChainName } from '../../utils';
import { balancify, closeWebsockets } from '../utils';
import { getBalances } from './getBalances.js';

export async function getAssetOnRelayChain (addresses, chainName, userAddedEndpoints) {
  const results = {};

  await getBalances(chainName, addresses, userAddedEndpoints)
    .then(({ api, balanceInfo, connectionsToBeClosed }) => {
      balanceInfo.forEach(({ address, balances, pooledBalance, soloTotal }) => {
        const totalBalance = balances.freeBalance.add(balances.reservedBalance).add(pooledBalance);
        const genesisHash = api.genesisHash.toString();

        const priceId = TEST_NETS.includes(genesisHash)
          ? undefined
          : getPriceIdByChainName(chainName, userAddedEndpoints);

        results[address] = [{ // since some chains may have more than one asset hence we use an array here! even thought its not needed for relay chains but just to be as a general rule.
          assetId: NATIVE_TOKEN_ASSET_ID,
          balanceDetails: balancify({ ...balances, pooledBalance, soloTotal }),
          chainName,
          decimal: api.registry.chainDecimals[0],
          genesisHash,
          priceId,
          token: api.registry.chainTokens[0],
          totalBalance: String(totalBalance)
        }];
      });

      closeWebsockets(connectionsToBeClosed);
    })
    .catch((error) => {
      console.error(`getAssetOnRelayChain: Error fetching balances for ${chainName}:`, error);
    }).finally(() => {
      Object.keys(results).length
        ? postMessage(JSON.stringify({ functionName: 'getAssetOnRelayChain', results }))
        : postMessage({ functionName: 'getAssetOnRelayChain' });
    });
}
