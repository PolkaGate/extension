// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ethers } from 'ethers';

import { BN } from '@polkadot/util';

import { ERC20_ABI, ERC20_TOKENS } from './constantsEth';
import { getEthProvider } from './getEthProvider';

export interface FeeEstimateParams {
  chainName: string;
  from: string;
  to: string;
  value?: string; // amount to transfer (in ETH or token units)
  token?: string; // token symbol, e.g., "ETH", "USDT", etc.
}

export interface EthFee {
  currencySymbol: string
  fee: BN
}

export async function getEthFee({ chainName, from, to, token = 'ETH', value }: FeeEstimateParams): Promise<EthFee> {
  const provider = getEthProvider(chainName);

  if (!provider) {
    throw new Error(`Could not get provider for ${chainName}`);
  }

  if (!value) {
    throw new Error('Value is required');
  }

  let tx: Parameters<typeof provider.estimateGas>[0];

  if (token === 'ETH') {
    tx = { from, to, value: ethers.parseEther(value) };
  } else {
    const tokenInfo = ERC20_TOKENS[chainName]?.[token];

    if (!tokenInfo) {
      throw new Error(`Token contract not found for ${token} on ${chainName}`);
    }

    const contract = new ethers.Contract(tokenInfo.contract, ERC20_ABI, provider);
    const data = contract.interface.encodeFunctionData('transfer', [to, value]);

    tx = { data, from, to: tokenInfo.contract };
  }

  const estimatedGas = await provider.estimateGas(tx);
  const gasLimit = estimatedGas + (estimatedGas / 2n); // +50% buffer

  const { gasPrice = 0n, maxFeePerGas = 0n, maxPriorityFeePerGas = 0n } = await provider.getFeeData();
  const { baseFeePerGas } = await provider.getBlock('latest') || {};

  // Dynamic priority fee: at least 20 gwei or maxPriorityFeePerGas
  const twentyGwei = 20_000_000_000n;
  const dynamicPriorityFee = maxPriorityFeePerGas && maxPriorityFeePerGas > twentyGwei ? maxPriorityFeePerGas : twentyGwei;

  let effectiveGasPrice: bigint;

  if (baseFeePerGas) {
    // EIP-1559 fee calculation with dynamic priority fee using formula: maxFeePerGas = 2 * baseFeePerGas + maxPriorityFeePerGas
    const calcMaxFeePerGas = 2n * baseFeePerGas + dynamicPriorityFee;

    effectiveGasPrice = maxFeePerGas && maxFeePerGas < calcMaxFeePerGas ? maxFeePerGas : calcMaxFeePerGas;
  } else {
    // Legacy network fallback
    effectiveGasPrice = gasPrice || 0n;
  }

  if (effectiveGasPrice === 0n) {
    throw new Error('Could not fetch gas price');
  }

  const fee = gasLimit * effectiveGasPrice;

  return {
    currencySymbol: token,
    fee: new BN(fee)
  };
}
