// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createErc20Assets } from '@polkagate/apps-config/assets';
import { Contract, ethers } from 'ethers';

import { BN } from '@polkadot/util';

import { ERC20_ABI } from '../../evmUtils/constantsEth';
import { getChainEndpoints } from '../utils';

const erc20Assets = createErc20Assets();

/**
 * @param {string} chainName
 * @param {string[]} addresses
 * @param {string} genesisHash
 * @param {import('../../types').UserAddedChains} userAddedEndpoints
 */
export const getERC20Balances = async(chainName, addresses, genesisHash, userAddedEndpoints) => {
  const chainEndpoints = getChainEndpoints(chainName, userAddedEndpoints);
  const rpcs = chainEndpoints.map(({ value }) => value.replace(/^wss:/, 'https:'));
  let provider;

  const tokenInfo = erc20Assets
    .map(({ instances, ...rest }) => {
      const instance = instances.find(({ chainId }) => chainId === genesisHash);

      return instance
        ? { contractAddress: instance.contractAddress, ...rest }
        : null;
    })
    .filter((i) => !!i);

  console.log('Filtered ERC20 Assets:', tokenInfo);

  for (const rpc of rpcs) {
    try {
      const p = new ethers.JsonRpcProvider(rpc);

      // quick health check
      await p.getBlockNumber();

      provider = p;
      break;
    } catch (err) {
      console.log(`Failed to create provider for ${chainName}:`, err, rpc);
    }
  }

  if (!provider) {
    console.log('No working RPC provider found', chainName);

    return;
  }

  const balanceInfo = await Promise.all(addresses.map(async(addr) => {
    /**
     * @typedef {Object} Asset
     * @property {string} assetId
     * @property {{ freeBalance: string }} balanceDetails
     * @property {string} chainName
     * @property {number} decimal
     * @property {boolean} isAsset
     * @property {string} [priceId]
     * @property {string} token
     * @property {string} totalBalance
     */

    /** @type {Asset[]} */
    const assets = [];

    if (tokenInfo?.length) {
      await Promise.all(tokenInfo.map(async({ contractAddress, priceId, symbol, ui }) => {
        try {
          console.log('Fetching', symbol, 'for', addr, 'on', chainName, 'contractAddress:', contractAddress);
          const tokenContract = new Contract(contractAddress, ERC20_ABI, provider);
          let balance;

          try {
            balance = await tokenContract['balanceOf'](addr);
          } catch (err) {
            console.warn(`Failed to fetch balanceOf for ERC-20 ${symbol} for ${addr} on ${chainName}:`, err);

            return;
          }

          if (!balance) {
            return;
          }

          let decimals;

          try {
            decimals = await tokenContract['decimals']();
          } catch (err) {
            console.log(`Failed to fetch decimals for ERC-20 ${symbol} for ${addr} on ${chainName}:`, err);

            return;
          }

          const totalBalance = String(new BN(balance));

          const item = {
            assetId: contractAddress,
            balanceDetails: {
              freeBalance: totalBalance
            },
            chainName,
            decimal: new BN(decimals.toString()).toNumber(),
            genesisHash,
            isAsset: true,
            priceId,
            token: symbol,
            totalBalance,
            ui
          };

          assets.push(item);
        } catch (err) {
          console.log(`Failed to fetch ERC-20 ${symbol} for ${addr} on ${chainName}:`, err);
        }
      }));
    }

    // get native asset
    // let balance;
    // try {
    //   balance = await provider.getBalance(addr);
    // } catch (err) {
    //   console.log(`Failed to fetch native balance for ${addr} on ${chainName}:`, err?.message || err);
    //   balance = null;
    // }

    return { addr, assets };
  }));

  return balanceInfo.reduce((acc, { addr, assets }) => {
    // @ts-ignore
    acc[addr] = assets;

    return acc;
  }, {});
};
