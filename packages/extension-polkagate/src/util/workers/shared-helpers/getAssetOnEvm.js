// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

//@ts-nocheck
import { Contract } from 'ethers';

import { BN } from '@polkadot/util';

import { FETCHING_ASSETS_FUNCTION_NAMES, NATIVE_TOKEN_ASSET_ID, TEST_NETS } from '../../constants';
import { ERC20_ABI, ERC20_TOKENS, EVM_GENESISHASH_MAP } from '../../evmUtils/constantsEth';
import { getEthProvider } from '../../evmUtils/getEthProvider';
import { getPriceIdByChainName } from '../../misc';

export const getEthBalances = async (/** @type {string} */ chainName, /** @type {string[]} */ addresses) => {
  let provider;

  try {
    provider = getEthProvider(chainName);
  } catch (err) {
    console.warn(`Failed to create provider for ${chainName}:`, err?.message || err);

    return { balanceInfo: [], genesisHash: '', provider: null };
  }

  const tokenInfo = ERC20_TOKENS[chainName];

  /**
   * @type {string}
   */
  let genesisHash;

  try {
    const genesisBlock = await provider.getBlock(0);

    genesisHash = genesisBlock?.hash ?? '';
  } catch {
    console.log('failed to get genesis hash for:', chainName, 'falling back to known hash');
    genesisHash = EVM_GENESISHASH_MAP[chainName.toLowerCase()];
  }

  const balanceInfo = await Promise.all(addresses.map(async (addr) => {
    /**
     * @typedef {Object} Asset
     * @property {string} assetId
     * @property {{ freeBalance: string }} balanceDetails
     * @property {string} chainName
     * @property {number} decimal
     * @property {string} genesisHash
     * @property {boolean} isAsset
     * @property {string} priceId
     * @property {string} token
     * @property {string} totalBalance
     */

    /** @type {Asset[]} */
    const assets = [];

    if (tokenInfo) {
      await Promise.all(Object.entries(tokenInfo).map(async ([token, info]) => {
        const { contract, priceId } = info;

        try {
          console.log('Fetching', token, 'for', addr, 'on', chainName, 'contract:', contract);
          const tokenContract = new Contract(contract, ERC20_ABI, provider);
          let balance;

          try {
            balance = await tokenContract['balanceOf'](addr);
          } catch (err) {
            console.warn(`Failed to fetch balanceOf for ERC-20 ${token} for ${addr} on ${chainName}:`, err?.message || err);

            return;
          }

          if (!balance) {
            return;
          }

          let decimals;

          try {
            decimals = await tokenContract['decimals']();
          } catch (err) {
            console.warn(`Failed to fetch decimals for ERC-20 ${token} for ${addr} on ${chainName}:`, err?.message || err);

            return;
          }

          const balanceStr = String(new BN(balance));

          const item = {
            assetId: contract,
            balanceDetails: {
              freeBalance: balanceStr
            },
            chainName,
            decimal: new BN(decimals.toString()).toNumber(),
            genesisHash,
            isAsset: true,
            priceId,
            token,
            totalBalance: balanceStr
          };

          assets.push(item);
        } catch (err) {
          console.warn(`Failed to fetch ERC-20 ${token} for ${addr} on ${chainName}:`, err?.message || err);
        }
      }));
    }

    // get native asset
    let balance;

    try {
      balance = await provider.getBalance(addr);
    } catch (err) {
      console.warn(`Failed to fetch native balance for ${addr} on ${chainName}:`, err?.message || err);
      balance = null;
    }

    return { address: addr, assets, balances: balance };
  }));

  return {
    balanceInfo,
    genesisHash,
    provider
  };
};

/**
 * @param {string[]} addresses
 * @param {string} chainName
 * @param {MessagePort } port
 */
export async function getAssetOnEvm (addresses, chainName, port) {
  const results = {};

  try {
    const { balanceInfo, genesisHash } = await getEthBalances(chainName, addresses) ?? {};

    console.log('evm balanceInfo:', balanceInfo);

    if (!balanceInfo) {
      return;
    }

    balanceInfo.forEach(({ address, assets = [], balances }) => {
      const priceId = TEST_NETS.includes(genesisHash)
        ? undefined
        : getPriceIdByChainName(chainName);

      const balance = balances ? String(new BN(balances)) : '0';

      // @ts-ignore
      results[address] = [{
        assetId: NATIVE_TOKEN_ASSET_ID,
        balanceDetails: ({ freeBalance: balance }),
        chainName,
        decimal: 18,
        genesisHash,
        priceId,
        token: 'ETH',
        totalBalance: balance
      },
      ...assets
      ];
    });
  } catch (error) {
    console.error(`getAssetOnEvm: Error fetching balances for ${chainName}:`, error);
  } finally {
    console.info(chainName, ': account assets fetched.', results);
    Object.keys(results).length
      ? port.postMessage(JSON.stringify({ functionName: FETCHING_ASSETS_FUNCTION_NAMES.EVM, results }))
      : port.postMessage(JSON.stringify({ functionName: FETCHING_ASSETS_FUNCTION_NAMES.EVM, results: null }));
  }
}
