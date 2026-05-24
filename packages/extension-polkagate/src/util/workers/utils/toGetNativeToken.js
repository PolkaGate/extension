// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN_ZERO } from '@polkadot/util';

import { getPriceIdByChainName } from '../..';
import { isOnAssetHub } from '../../chain';
import { NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '../../constants';
import { isMigratedHub } from '../../migrateHubUtils';
import { getStakingBalances } from '../shared-helpers/getStakingBalances';
import { balancify } from '.';

/**
 * @param {any[]} addresses
 * @param {import("@polkadot/api").ApiPromise} api
 * @param {string | undefined} chainName
 */
export async function toGetNativeToken(addresses, api, chainName) {
  const _result = {};

  const balances = await Promise.all(addresses.map((address) => api.derive.balances.all(address)));

  const systemBalance = await Promise.all(addresses.map((address) => api.query['system']['account'](address)));
  const existentialDeposit = api.consts['balances']['existentialDeposit'];

  await Promise.all(addresses.map(async (address, index) => {
    // @ts-ignore
    balances[index].ED = existentialDeposit;
    // @ts-ignore
    balances[index].frozenBalance = systemBalance[index].data.frozen;

    const totalBalance = balances[index].freeBalance.add(balances[index].reservedBalance);

    const genesisHash = api.genesisHash.toString();
    const isAssetHub = isOnAssetHub(genesisHash);

    let maybeStakings;

    if (isAssetHub && isMigratedHub(genesisHash)) {
      maybeStakings = await getStakingBalances(address, api);
    }

    // @ts-ignore
    _result[address] = [{
      assetId: isAssetHub ? NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB : NATIVE_TOKEN_ASSET_ID,
      balanceDetails: balancify(balances[index]),
      chainName,
      claimPermissions: maybeStakings?.pooled?.claimPermissions,
      decimal: api.registry.chainDecimals[0],
      genesisHash,
      isNative: true,
      poolName: maybeStakings?.pooled?.poolName,
      poolReward: maybeStakings?.pooled?.poolReward ?? BN_ZERO,
      pooledBalance: maybeStakings?.pooled?.pooledBalance ?? BN_ZERO,
      priceId: getPriceIdByChainName(chainName),
      soloTotal: maybeStakings?.soloTotal,
      token: api.registry.chainTokens[0],
      totalBalance: String(totalBalance)
    }];
  }));

  return _result;
}
