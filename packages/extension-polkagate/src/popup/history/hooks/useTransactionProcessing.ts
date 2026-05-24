// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable camelcase */

import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { Extrinsics, TransactionDetail, Transfers } from '../../../util/types';
import type { RecordTabStatus, RecordTabStatusGov } from '../hookUtils/types';

import { type Dispatch, type SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

import { useAccounts } from '@polkadot/extension-polkagate/src/hooks';
import { amountToHuman, getSubstrateAddress } from '@polkadot/extension-polkagate/src/util';
import { isEthereumAddress } from '@polkadot/util-crypto';

import { formatString, log } from '../hookUtils/utils';

const getName = (accounts: AccountJson[], address: string) => {
  let baseAddress: string | undefined;

  try {
    baseAddress = isEthereumAddress(address) ? address : getSubstrateAddress(address);
  } catch {
    baseAddress = address;
  }

  if (!baseAddress) {
    return undefined;
  }

  return accounts.find((a) => a.address.toLowerCase() === baseAddress?.toLowerCase())?.name;
};

interface UseTransactionProcessingProps {
  address: string | undefined;
  receivedTx: RecordTabStatus;
  extrinsicsTx: RecordTabStatusGov;
  chain: Chain | null | undefined;
  decimal: number | undefined;
  token: string | undefined;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

interface UseTransactionProcessingResult {
  processedReceived: TransactionDetail[] | undefined;
  processedExtrinsics: TransactionDetail[] | undefined;
}

/**
 * Processes raw transaction data from APIs into standardized format
 * Tracks initial fetch completion
 */
export function useTransactionProcessing({ address, chain, decimal, extrinsicsTx, receivedTx, setIsLoading, token }: UseTransactionProcessingProps): UseTransactionProcessingResult {
  const accounts = useAccounts();

  const [processedReceived, setProcessedReceived] = useState<TransactionDetail[] | undefined>(undefined);
  const [processedExtrinsics, setProcessedExtrinsics] = useState<TransactionDetail[] | undefined>(undefined);

  // Track initial fetch completion
  const initialFetchDoneRef = useRef({
    extrinsics: false,
    received: false
  });

  // Stable callback to check if both fetches are complete
  const checkAndNotifyComplete = useCallback(() => {
    if (initialFetchDoneRef.current.received && initialFetchDoneRef.current.extrinsics) {
      setIsLoading(false);
      log('All initial data loaded');
    }
  }, [setIsLoading]);

  useEffect(() => {
    initialFetchDoneRef.current = {
      extrinsics: false,
      received: false
    };
    setProcessedReceived(undefined);
    setProcessedExtrinsics(undefined);
    log('Reset processed transaction state');
  }, [address, chain?.genesisHash]);

  // Process transfer transactions
  useEffect(() => {
    if (receivedTx.genesisHash && receivedTx.genesisHash !== chain?.genesisHash) {
      log(`Skipping received processing for stale chain ${receivedTx.genesisHash}`);

      return;
    }

    // fetching done and there is no receive items
    if (!receivedTx.hasMore && !receivedTx.isFetching && !receivedTx.transactions?.length) {
      setProcessedReceived([]);

      if (!initialFetchDoneRef.current.received) {
        initialFetchDoneRef.current.received = true;
        log('Initial received fetch complete (empty)');
        checkAndNotifyComplete();
      }

      return;
    }

    if (!receivedTx.transactions?.length) {
      return;
    }

    log(`Processing ${receivedTx.transactions.length} transfer transactions`);

    const processed: TransactionDetail[] = receivedTx.transactions.map((tx: Transfers): TransactionDetail => {
      const fromName = tx.from_account_display?.display ?? getName(accounts, tx.from);

      const txDetail: TransactionDetail = {
        action: 'balances',
        amount: tx.amount,
        block: tx.block_num,
        chain,
        date: tx.block_timestamp * 1000,
        fee: tx.fee,
        forAccount: tx.forAccount,
        from: { address: tx.from, name: fromName },
        subAction: 'receive',
        success: tx.success,
        to: { address: tx.to, name: tx.to_account_display?.display },
        token: tx.asset_symbol,
        txHash: tx.hash
      };

      // Identify staking rewards
      if (txDetail.from.name?.toLowerCase().includes('reward')) {
        txDetail.action = 'pool staking';
        txDetail.subAction = 'reward';
      }

      return txDetail;
    });

    log(`Processed ${processed.length} transfer transactions`);
    setProcessedReceived(processed);

    // Mark initial fetch complete
    if (receivedTx.pageNum === 1 && !initialFetchDoneRef.current.received) {
      initialFetchDoneRef.current.received = true;
      log('Initial received fetch complete');
      checkAndNotifyComplete();
    }
  }, [accounts, chain, checkAndNotifyComplete, receivedTx.genesisHash, receivedTx.hasMore, receivedTx.isFetching, receivedTx.pageNum, receivedTx.transactions]);

  // Process extrinsics
  useEffect(() => {
    if (extrinsicsTx.genesisHash && extrinsicsTx.genesisHash !== chain?.genesisHash) {
      log(`Skipping extrinsics processing for stale chain ${extrinsicsTx.genesisHash}`);

      return;
    }

    // fetching done and there is no extrinsic items
    if (!extrinsicsTx.hasMore && !extrinsicsTx.isFetching && !extrinsicsTx.transactions?.length) {
      setProcessedExtrinsics([]);

      if (!initialFetchDoneRef.current.extrinsics) {
        initialFetchDoneRef.current.extrinsics = true;
        log('Initial extrinsics fetch complete (empty)');
        checkAndNotifyComplete();
      }

      return;
    }

    if (!extrinsicsTx?.transactions?.length || !decimal) {
      return;
    }

    log(`Processing ${extrinsicsTx.transactions.length} extrinsics`);

    const processed: TransactionDetail[] = extrinsicsTx.transactions.map((extrinsic: Extrinsics): TransactionDetail => {
      const { account_display, amount, amountInHuman, block_num, block_timestamp, call_module, call_module_function, calls, conviction, delegatee, extrinsic_hash, fee, forAccount, nominators, poolId, refId, success, to, to_account_display, voteType } = extrinsic;
      // Determine action type
      const action = getActionType(call_module);
      const subAction = action === 'balances'
        ? 'send'
        : formatString(call_module_function);

      const toName = to_account_display?.display ?? (to ? getName(accounts, to) : '');

      return {
        action,
        amount: parseAmount(amount, decimal, amountInHuman),
        block: block_num,
        calls,
        chain,
        class: extrinsic.class,
        conviction,
        date: block_timestamp * 1000,
        delegatee,
        fee,
        forAccount,
        from: { address: account_display.address, name: '' },
        nominators,
        poolId,
        refId,
        subAction,
        success,
        to: extrinsic.to
          ? {
            address: extrinsic.to,
            name: toName
          }
          : undefined,
        token,
        txHash: extrinsic_hash,
        voteType
      };
    });

    log(`Processed ${processed.length} extrinsics`);
    setProcessedExtrinsics(processed);

    // Mark initial fetch complete
    if (extrinsicsTx.pageNum === 1 && !initialFetchDoneRef.current.extrinsics) {
      initialFetchDoneRef.current.extrinsics = true;
      log('Initial extrinsics fetch complete');
      checkAndNotifyComplete();
    }
  }, [accounts, chain, checkAndNotifyComplete, decimal, extrinsicsTx.genesisHash, extrinsicsTx.hasMore, extrinsicsTx.isFetching, extrinsicsTx.pageNum, extrinsicsTx.transactions, token]);

  return {
    processedExtrinsics,
    processedReceived
  };
}

// Helper: Determine action type from module name
function getActionType(callModule: string): string {
  switch (callModule) {
    case 'nominationpools':
      return 'pool staking';
    case 'convictionvoting':
      return 'governance';
    case 'staking':
      return 'solo staking';
    default:
      return callModule;
  }
}

// Helper: Parse amount considering decimal places
function parseAmount(amount: string | undefined, decimal: number, amountInHuman?: boolean): string | undefined {
  if (amount === undefined) {
    return undefined;
  }

  const sanitizedAmount = amount.replace(/,/g, '');

  if (amountInHuman) {
    return sanitizedAmount;
  }

  // Subscan balance params are generally returned in machine units.
  // Small raw balances can still have fewer digits than the chain decimals
  // (e.g. 0.01 DOT => 100000000 Planck on a 10-decimal chain), so digit
  // length is not a reliable signal that the value is already human-readable.
  const isAlreadyInHuman = sanitizedAmount.includes('.');

  if (isAlreadyInHuman) {
    return sanitizedAmount;
  }

  return amountToHuman(sanitizedAmount, decimal);
}
