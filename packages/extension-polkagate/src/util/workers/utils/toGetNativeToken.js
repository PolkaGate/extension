// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import { NATIVE_TOKEN_ASSET_ID } from '../../constants';
import { getPriceIdByChainName } from '../../utils';
// eslint-disable-next-line import/extensions
import { balancify } from '.';

export async function toGetNativeToken (addresses, api, chainName) {
  const _result = {};

  const balances = await Promise.all(addresses.map((address) => api.derive.balances.all(address)));

  const systemBalance = await Promise.all(addresses.map((address) => api.query.system.account(address)));

  addresses.forEach((address, index) => {
    balances[index].frozenBalance = systemBalance[index].frozen;

    const totalBalance = balances[index].freeBalance.add(balances[index].reservedBalance);

    _result[address] = [{
      assetId: NATIVE_TOKEN_ASSET_ID, // Rule: we set asset id 0 for native tokens
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
