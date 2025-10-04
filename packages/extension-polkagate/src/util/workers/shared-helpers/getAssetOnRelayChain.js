// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FETCHING_ASSETS_FUNCTION_NAMES, NATIVE_TOKEN_ASSET_ID, TEST_NETS } from '../../constants';
import { getPriceIdByChainName } from '../../misc';
import { balancify, closeWebsockets } from '../utils';
import { getBalances } from './getBalances.js';

/**
 * @param {string[]} addresses
 * @param {string} chainName
 * @param {import('../../types').UserAddedChains} userAddedEndpoints
 * @param {MessagePort } port
 */
export async function getAssetOnRelayChain (addresses, chainName, userAddedEndpoints, port) {
  const results = {};

  try {
    const { api, balanceInfo, connectionsToBeClosed } = await getBalances(chainName, addresses, userAddedEndpoints, port) ?? {};

    if (!api || !balanceInfo || !connectionsToBeClosed) {
      return;
    }

    const genesisHash = api.genesisHash.toString();

    balanceInfo.forEach(({ address, balances, poolName, poolReward, pooledBalance, soloTotal }) => {
      const totalBalance = balances.freeBalance.add(balances.reservedBalance);

      const priceId = TEST_NETS.includes(genesisHash)
        ? undefined
        : getPriceIdByChainName(chainName, userAddedEndpoints);

      // @ts-ignore
      results[address] = [{ // since some chains may have more than one asset hence we use an array here! even thought its not needed for relay chains but just to be as a general rule.
        assetId: NATIVE_TOKEN_ASSET_ID,
        balanceDetails: balancify({ ...balances, poolReward, pooledBalance, soloTotal }),
        chainName,
        decimal: api.registry.chainDecimals[0],
        genesisHash,
        isNative: true,
        poolName,
        priceId,
        token: api.registry.chainTokens[0],
        totalBalance: String(totalBalance)
      }];
    });

    closeWebsockets(connectionsToBeClosed);
  } catch (error) {
    console.error(`getAssetOnRelayChain: Error fetching balances for ${chainName}:`, error);
  } finally {
    console.info(chainName, ': account assets fetched.');
    Object.keys(results).length
      ? port.postMessage(JSON.stringify({ functionName: FETCHING_ASSETS_FUNCTION_NAMES.RELAY, results }))
      : port.postMessage(JSON.stringify({ functionName: FETCHING_ASSETS_FUNCTION_NAMES.RELAY, results: null }));
  }
}
