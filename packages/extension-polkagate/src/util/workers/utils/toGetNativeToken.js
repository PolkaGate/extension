// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '../../constants';
import { getPriceIdByChainName, isOnAssetHub } from '../../utils';
// eslint-disable-next-line import/extensions
import { balancify } from '.';

/**
 * @param {any[]} addresses
 * @param {import("@polkadot/api").ApiPromise} api
 * @param {string | undefined} chainName
 */
export async function toGetNativeToken (addresses, api, chainName) {
  const _result = {};

  const balances = await Promise.all(addresses.map((address) => api.derive.balances.all(address)));

  const systemBalance = await Promise.all(addresses.map((address) => api.query['system']['account'](address)));
  const existentialDeposit = api.consts['balances']['existentialDeposit'];

  addresses.forEach((address, index) => {
    // @ts-ignore
    balances[index].ED = existentialDeposit;
    // @ts-ignore
    balances[index].frozenBalance = systemBalance[index].data.frozen;

    const totalBalance = balances[index].freeBalance.add(balances[index].reservedBalance);

    const isAssetHub = isOnAssetHub(api.genesisHash.toString());

    // @ts-ignore
    _result[address] = [{
      assetId: isAssetHub ? NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB : NATIVE_TOKEN_ASSET_ID,
      balanceDetails: balancify(balances[index]),
      chainName,
      decimal: api.registry.chainDecimals[0],
      genesisHash: api.genesisHash.toString(),
      priceId: getPriceIdByChainName(chainName), // based on the fact that chains native token price id is the same as their chain names
      token: api.registry.chainTokens[0],
      totalBalance: String(totalBalance)
    }];
  });

  return _result;
}
