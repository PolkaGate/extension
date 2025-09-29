// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferRequest } from '../types';

import fetch from 'node-fetch';

import { BN } from '@polkadot/util';

import { amountToHuman } from '../amount';
import { EVM_CHAIN_ID_MAP } from '../evmUtils/ETH_CHAIN_IDS';
import getChainInfoByName from '../getChainInfoByName';
import { nullObject } from './getTransfers';

const ETHERSCAN_API_KEY = process.env['ETHERSCAN_API_KEY'];

export interface EtherscanTx {
  blockHash: string;
  blockNumber: string;
  confirmations: string; // number of confirmations
  contractAddress: string; // empty string if not contract creation
  cumulativeGasUsed: string;
  from: string; // sender address
  functionName: string; // optional, only for contract calls
  gas: string;
  gasPrice: string;
  gasUsed: string;
  hash: string; // transaction hash
  input: string; // calldata
  isError: '0' | '1'; // "0" = success, "1" = failed
  methodId?: string; // optional, first 4 bytes of function selector
  nonce: string;
  timeStamp: string; // unix timestamp
  to: string; // recipient address
  transactionIndex: string;
  txreceipt_status: '0' | '1'; // "1" = success
  value: string; // ETH value in wei
}

export interface EtherscanResponse<T> {
  for: string;
  status: string; // "1" = success, "0" = error
  message: string; // "OK" or error message
  result: T; // array of transactions or other type
}

const convertTxToPolkaGateStyle = (transfers: EtherscanTx[], decimal: number | undefined) => {
  return transfers.map(({ blockNumber, from, functionName, gasPrice, gasUsed, hash, isError, nonce, timeStamp, to, transactionIndex, value }) => {
    const _gasUsed = new BN(gasUsed);
    const _gasPrice = new BN(gasPrice);

    const feeWei = _gasUsed.mul(_gasPrice);

    return {
      amount: amountToHuman(value, decimal),
      asset_symbol: 'ETH',
      block_num: Number(blockNumber),
      block_timestamp: Number(timeStamp),
      decimal,
      extrinsic_index: transactionIndex,
      fee: feeWei,
      from,
      // from_account_display: '',
      hash,
      module: functionName, // needs double check
      nonce: Number(nonce),
      success: isError === '0',
      to,
      // to_account_display: ''
    };
  });
};

/**
 * Fetch transaction history for an Ethereum address
 * @param address Ethereum address (0x...)
 * @param page default 1
 * @param offset default 10
 * @param sort asc|desc default desc
 */
export async function getEthTxHistory (
  chainName: string,
  address: string,
  page = 1,
  offset = 10,
  sort: 'asc' | 'desc' = 'desc'
): Promise<TransferRequest> {
  const decimal = getChainInfoByName(chainName)?.tokenDecimal;

  console.log('Fetching transaction history from etherscan ...', chainName, decimal);

  const chainId = EVM_CHAIN_ID_MAP[chainName.toLowerCase()];
  const url = `https://api.etherscan.io/v2/api
  ?chainid=${chainId}
  &module=account
  &action=txlist
  &address=${address}
  &startblock=0
  &endblock=99999999
  &page=${page}
  &offset=${offset}
  &sort=${sort}
  &apikey=${ETHERSCAN_API_KEY}`.replace(/\s+/g, '');

  try {
    const res = await fetch(url);
    const data = (await res.json()) as EtherscanResponse<EtherscanTx[]>;

    if (data.status !== '1') {
      console.log(`Etherscan error: ${data.message}`);

      return (await Promise.resolve(nullObject));
    }

    return {
      data: {
        count: data.result.length,
        transfers: convertTxToPolkaGateStyle(data.result, decimal)
      },
      for: `${address} - ${chainName}`
    };
  } catch (err) {
    console.error('Failed to fetch tx history:', err);

    return (await Promise.resolve(nullObject));
  }
}
