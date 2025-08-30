// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

//@ts-nocheck

import { BN_ZERO } from '@polkadot/util';

import { ASSET_HUBS, NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '../../constants';
import { getPriceIdByChainName } from '../../utils';
import { getStakingBalances } from '../shared-helpers/getStakingBalances';
import { isMigratedHub } from './adjustGenesis';
import { balancify } from '.';

export async function toGetNativeToken (addresses, api, chainName) {
  const _result = {};

  const balances = await Promise.all(addresses.map((address) => api.derive.balances.all(address)));

  const systemBalance = await Promise.all(addresses.map((address) => api.query.system.account(address)));
  const existentialDeposit = api.consts.balances.existentialDeposit;

 await Promise.all(addresses.map(async (address, index) => {
  balances[index].ED = existentialDeposit;
  balances[index].frozenBalance = systemBalance[index].data.frozen;

  const totalBalance = balances[index].freeBalance.add(balances[index].reservedBalance);

  const genesisHash = api.genesisHash.toString();
  const isAssetHub = ASSET_HUBS.includes(genesisHash);

  let maybeStakingTotals;

  if (isAssetHub && isMigratedHub(genesisHash)) {
    maybeStakingTotals = await getStakingBalances(address, api);
  }

  _result[address] = [{
    assetId: isAssetHub ? NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB : NATIVE_TOKEN_ASSET_ID,
    balanceDetails: balancify(balances[index]),
    chainName,
    decimal: api.registry.chainDecimals[0],
    genesisHash,
    poolName: maybeStakingTotals?.pooled?.poolName,
    poolReward: maybeStakingTotals?.pooled?.poolReward ?? BN_ZERO,
    pooledBalance: maybeStakingTotals?.pooled?.pooledBalance ?? BN_ZERO,
    priceId: getPriceIdByChainName(chainName),
    soloTotal: maybeStakingTotals?.soloTotal,
    token: api.registry.chainTokens[0],
    totalBalance: String(totalBalance)
  }];
}));

  return _result;
}
