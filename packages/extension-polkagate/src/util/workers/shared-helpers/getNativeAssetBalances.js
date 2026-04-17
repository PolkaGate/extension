// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN_ZERO } from '@polkadot/util';

import { getPriceIdByChainName } from '../..';
import { NATIVE_TOKEN_ASSET_ID, TEST_NETS } from '../../constants';
import { balancify, fastestEndpoint, getChainEndpoints, metadataFromApi } from '../utils';
import { getStakingBalances } from './getStakingBalances';

/**
 * @param {string} chainName
 * @param {string[]} addresses
 * @param {import('../../types').UserAddedChains} userAddedEndpoints
 * @param {MessagePort} port
 * @returns
 * @param {string} functionName
 */
export async function getNativeAssetBalances(functionName, chainName, addresses, userAddedEndpoints, port) {
  const chainEndpoints = getChainEndpoints(chainName, userAddedEndpoints);
  const { api } = await fastestEndpoint(chainEndpoints);

  try {
    if (api.isConnected && api.derive.balances) {
      const { metadata } = await metadataFromApi(api);

      console.info(chainName, 'metadata : fetched and saved.(getNativeAssetBalances)');
      port.postMessage(JSON.stringify({ functionName, metadata }));

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

        const totalBalance = String(balances.freeBalance.add(balances.reservedBalance));
        const genesisHash = api.genesisHash.toString();

        const priceId = TEST_NETS.includes(genesisHash)
          ? undefined
          : getPriceIdByChainName(chainName, userAddedEndpoints);

        const poolReward = pooled?.poolReward ?? BN_ZERO;
        const pooledBalance = pooled?.pooledBalance ?? BN_ZERO;

        return {
          address,
          assetId: NATIVE_TOKEN_ASSET_ID,
          balanceDetails: balancify({ ...balances, poolReward, pooledBalance, soloTotal }),
          balances,
          chainName,
          claimPermissions: pooled?.claimPermissions ?? null,
          decimal: api.registry.chainDecimals[0],
          genesisHash,
          isNative: true,
          poolName: pooled?.poolName,
          priceId,
          soloTotal,
          token: api.registry.chainTokens[0],
          totalBalance
        };
      });

      const balanceInfo = await Promise.all(requests);

      /** @type {Record<string, Array<any>>} */
      const results = {};

      balanceInfo.forEach(({ address, ...rest }) => {
        results[address] = [{ // since some chains may have more than one asset hence we use an array here! even thought its not needed for relay chains but just to be as a general rule.
          ...rest
        }];
      });

      return results;
    }
  } finally {
    await api.disconnect().catch(console.error);
  }

  return undefined;
}
