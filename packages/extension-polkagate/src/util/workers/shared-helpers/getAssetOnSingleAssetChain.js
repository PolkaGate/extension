// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FETCHING_ASSETS_FN } from '../../constants';
import { getNativeAssetBalances } from './getNativeAssetBalances.js';

/**
 * @param {string[]} addresses
 * @param {string} chainName
 * @param {import('../../types').UserAddedChains} userAddedEndpoints
 * @param {MessagePort } port
 */
export async function getAssetOnSingleAssetChain(addresses, chainName, userAddedEndpoints, port) {
  let results = {};
  const functionName = FETCHING_ASSETS_FN.SINGLE_ASSET;

  try {
    results = await getNativeAssetBalances(functionName, chainName, addresses, userAddedEndpoints, port) ?? {};
  } catch (error) {
    console.error(`getAssetOnSingleAssetChain: Error fetching balances for ${chainName}:`, error);
  } finally {
    console.info(chainName, ': account assets fetched.', results);
    Object.keys(results).length
      ? port.postMessage(JSON.stringify({ functionName, results }))
      : port.postMessage(JSON.stringify({ functionName, results: null }));
  }
}
