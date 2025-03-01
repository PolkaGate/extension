// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN_ZERO } from '@polkadot/util';

import { MIGRATED_NOMINATION_POOLS_CHAINS, NATIVE_TOKEN_ASSET_ID, TEST_NETS } from '../../constants';
import { getPriceIdByChainName } from '../../utils';
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

    balanceInfo.forEach(({ address, balances, pooledBalance, soloTotal }) => {
      const genesisHash = api.genesisHash.toString();
      const isMigrated = MIGRATED_NOMINATION_POOLS_CHAINS.includes(genesisHash);
      const totalBalance = balances.freeBalance.add(balances.reservedBalance).add(isMigrated ? BN_ZERO : pooledBalance);

      const priceId = TEST_NETS.includes(genesisHash)
        ? undefined
        : getPriceIdByChainName(chainName, userAddedEndpoints);

      // @ts-ignore
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
  } catch (error) {
    console.error(`getAssetOnRelayChain: Error fetching balances for ${chainName}:`, error);
  } finally {
    console.info('Shared worker, account assets fetched and send on chain:', chainName);
    Object.keys(results).length
      ? port.postMessage(JSON.stringify({ functionName: 'getAssetOnRelayChain', results }))
      : port.postMessage(JSON.stringify({ functionName: 'getAssetOnRelayChain' }));
  }
}
