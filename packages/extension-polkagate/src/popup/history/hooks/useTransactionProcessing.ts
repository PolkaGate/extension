// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';
import type { Extrinsics, TransactionDetail, Transfers } from '../../../util/types';
import type { RecordTabStatus, RecordTabStatusGov } from '../hookUtils/types';

import { useCallback, useEffect, useRef, useState } from 'react';

import { formatString, log } from '../hookUtils/utils';

interface UseTransactionProcessingProps {
  receivedTx: RecordTabStatus;
  extrinsicsTx: RecordTabStatusGov;
  chain: Chain | null | undefined;
  decimal: number | undefined;
  token: string | undefined;
  onInitialLoadComplete: () => void;
}

interface UseTransactionProcessingResult {
  processedReceived: TransactionDetail[];
  processedExtrinsics: TransactionDetail[];
}

/**
 * Processes raw transaction data from APIs into standardized format
 * Tracks initial fetch completion
 */
export function useTransactionProcessing({ chain, decimal, extrinsicsTx, onInitialLoadComplete, receivedTx, token }: UseTransactionProcessingProps): UseTransactionProcessingResult {
  const [processedReceived, setProcessedReceived] = useState<TransactionDetail[]>([]);
  const [processedExtrinsics, setProcessedExtrinsics] = useState<TransactionDetail[]>([]);

  // Track initial fetch completion
  const initialFetchDoneRef = useRef({
    extrinsics: false,
    received: false
  });

  // Store callback in ref to avoid dependency issues
  const onInitialLoadCompleteRef = useRef(onInitialLoadComplete);

  useEffect(() => {
    onInitialLoadCompleteRef.current = onInitialLoadComplete;
  }, [onInitialLoadComplete]);

  // Stable callback to check if both fetches are complete
  const checkAndNotifyComplete = useCallback(() => {
    if (initialFetchDoneRef.current.received && initialFetchDoneRef.current.extrinsics) {
      onInitialLoadCompleteRef.current();
      log('All initial data loaded');
    }
  }, []);

  // Process transfer transactions
  useEffect(() => {
    if (!receivedTx?.transactions?.length) {
      return;
    }

    log(`Processing ${receivedTx.transactions.length} transfer transactions`);

    const processed: TransactionDetail[] = receivedTx.transactions.map((tx: Transfers): TransactionDetail => {
      const txDetail: TransactionDetail = {
        action: 'balances',
        amount: tx.amount,
        block: tx.block_num,
        chain,
        date: tx.block_timestamp * 1000,
        fee: tx.fee,
        from: { address: tx.from, name: tx.from_account_display?.display },
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
  }, [chain, receivedTx.transactions, receivedTx.pageNum, checkAndNotifyComplete]);

  // Process extrinsics
  useEffect(() => {
    if (!extrinsicsTx?.transactions?.length || !decimal) {
      return;
    }

    log(`Processing ${extrinsicsTx.transactions.length} extrinsics`);

    const processed: TransactionDetail[] = extrinsicsTx.transactions.map((extrinsic: Extrinsics): TransactionDetail => {
      // Determine action type
      const action = getActionType(extrinsic.call_module);
      const subAction = action === 'balances'
        ? 'send'
        : formatString(extrinsic.call_module_function);

      // Parse amount
      const amount = parseAmount(extrinsic.amount, decimal);

      return {
        action,
        amount,
        block: extrinsic.block_num,
        calls: extrinsic.calls,
        chain,
        class: extrinsic.class,
        conviction: extrinsic.conviction,
        date: extrinsic.block_timestamp * 1000,
        delegatee: extrinsic.delegatee,
        fee: extrinsic.fee,
        from: { address: extrinsic.account_display.address, name: '' },
        nominators: extrinsic.nominators,
        poolId: extrinsic.poolId,
        refId: extrinsic.refId,
        subAction,
        success: extrinsic.success,
        to: extrinsic.to
          ? {
            address: extrinsic.to,
            name: extrinsic.to_account_display?.display ?? ''
          }
          : undefined,
        token,
        txHash: extrinsic.extrinsic_hash,
        voteType: extrinsic.voteType
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
  }, [decimal, extrinsicsTx.transactions, extrinsicsTx.pageNum, token, chain, checkAndNotifyComplete]);

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
function parseAmount(amount: string | undefined, decimal: number): string | undefined {
  if (amount === undefined) {
    return undefined;
  }

  const isAlreadyInHuman = amount.indexOf('.') >= 0;

  if (isAlreadyInHuman) {
    return amount;
  }

  return (Number(amount) / (10 ** decimal)).toString();
}
