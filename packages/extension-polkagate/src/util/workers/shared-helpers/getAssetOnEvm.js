// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FETCHING_ASSETS_FN, NATIVE_TOKEN_ASSET_ID } from '../../constants';
import { getERC20Balances } from './getERC20Balances.js';
import { getNativeAssetBalances } from './getNativeAssetBalances.js';

/**
 * @param {string[]} addresses
 * @param {string} chainName
 * @param {MessagePort} port
 * @param {string} genesisHash
 * @param {import('../../types').UserAddedChains} userAddedEndpoints
 */
export async function getAssetOnEvm(addresses, chainName, genesisHash, userAddedEndpoints, port) {
  const results = {};
  const functionName = FETCHING_ASSETS_FN.EVM;

  try {
    const nativeBalances = await getNativeAssetBalances(functionName, chainName, addresses, userAddedEndpoints, port) ?? {};
    const ERC20Balances = await getERC20Balances(chainName, addresses, genesisHash, userAddedEndpoints);

    Object.entries(nativeBalances).forEach(([address, info]) => {
      // @ts-ignore
      results[address] = [{
        ...info[0],
        assetId: NATIVE_TOKEN_ASSET_ID
      },
      // @ts-ignore
      ...(ERC20Balances?.[address] || [])
      ];
    });
  } catch (error) {
    console.error(`getAssetOnEvm: Error fetching balances for ${chainName}:`, error);
  } finally {
    console.info(chainName, ': account assets fetched.', results);
    Object.keys(results).length
      ? port.postMessage(JSON.stringify({ functionName, results }))
      : port.postMessage(JSON.stringify({ functionName, results: null }));
  }
}
