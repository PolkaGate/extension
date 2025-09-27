// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces';
import type { Extrinsics, TransactionDetail, Transfers } from '../../util/types';
import type { FilterOptions, RecordTabStatus, RecordTabStatusGov, TransactionHistoryOutput } from './hookUtils/types';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { mapRelayToSystemGenesisIfMigrated } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';

import { useChainInfo } from '../../hooks';
import { getTxTransfers } from '../../util/api/getTransfers';
import { getTXsHistory } from '../../util/api/getTXsHistory';
import { INITIAL_STATE, MAX_LOCAL_HISTORY_ITEMS, MAX_PAGE, SINGLE_PAGE_SIZE } from './hookUtils/consts';
import { getHistoryFromStorage } from './hookUtils/getHistoryFromStorage';
import { saveHistoryToStorage } from './hookUtils/saveHistoryToStorage';
import { extrinsicsReducer, formatString, log, receivedReducer } from './hookUtils/utils';

export default function useTransactionHistory (address: AccountId | string | undefined, _genesisHash: string | undefined, filterOptions?: FilterOptions): TransactionHistoryOutput {
  const genesisHash = mapRelayToSystemGenesisIfMigrated(_genesisHash);
  const { chain, chainName, decimal, token } = useChainInfo(genesisHash, true);
  const [isLoading, setIsLoading] = useState(false);

  const [fetchedReceivedHistories, setFetchedReceivedHistories] = useState<TransactionDetail[]>([]);
  const [fetchedExtrinsicsHistories, setFetchedExtrinsicsHistories] = useState<TransactionDetail[]>([]);
  const [allHistories, setTabHistory] = useState<TransactionDetail[] | null>([]);
  const [localHistories, setLocalHistories] = useState<TransactionDetail[]>([]);

  // Previous values for comparison to detect changes
  const prevAddressRef = useRef<string | undefined>('');
  const prevGenesisHashRef = useRef<string | undefined>('');

  const [receivedTx, dispatchReceived] = useReducer(receivedReducer, INITIAL_STATE as RecordTabStatus);
  const [extrinsicsTx, dispatchExtrinsics] = useReducer(extrinsicsReducer, INITIAL_STATE as RecordTabStatusGov);

  // Refs for latest state values
  const receivedStateRef = useRef<RecordTabStatus>(receivedTx);
  const extrinsicsStateRef = useRef<RecordTabStatusGov>(extrinsicsTx);
  const observerInstance = useRef<IntersectionObserver>(null);
  const initialFetchDoneRef = useRef<{ received: boolean; extrinsics: boolean }>({
    extrinsics: false,
    received: false
  });
  const initialFetchInitiatedRef = useRef<{ received: boolean; extrinsics: boolean }>({
    extrinsics: false,
    received: false
  });

  const requested = useMemo(() => {
    if (!address || !chainName) {
      return undefined;
    }

    return `${String(address)} - ${chainName}`;
  }, [address, chainName]);

  // Detect changes in address or genesisHash to reset state
  useEffect(() => {
    const addressChanged = String(address) !== prevAddressRef.current;
    const genesisHashChanged = genesisHash !== prevGenesisHashRef.current;

    if (addressChanged || genesisHashChanged) {
      log(`Input changed: address: ${addressChanged}, genesisHash: ${genesisHashChanged}`);

      // Update refs to current values
      prevAddressRef.current = String(address);
      prevGenesisHashRef.current = genesisHash;

      if (address && genesisHash) {
        // Reset all state when address or chain changes
        setIsLoading(true);
        dispatchReceived({ type: 'RESET' });
        dispatchExtrinsics({ type: 'RESET' });
        setFetchedReceivedHistories([]);
        setFetchedExtrinsicsHistories([]);
        setTabHistory([]);
        setLocalHistories([]);

        // Reset Done fetch status
        initialFetchDoneRef.current = {
          extrinsics: false,
          received: false
        };

        // Reset initial fetch status
        initialFetchInitiatedRef.current = {
          extrinsics: false,
          received: false
        };

        log('All state reset due to input change');
      }
    }
  }, [address, genesisHash]);

  // Keep refs updated with latest state values
  useEffect(() => {
    receivedStateRef.current = receivedTx;
    log('Transfers state updated', { ...receivedTx });
  }, [receivedTx]);

  useEffect(() => {
    extrinsicsStateRef.current = extrinsicsTx;
    log('Extrinsics state updated', { ...extrinsicsTx });
  }, [extrinsicsTx]);

  // Convenience functions for dispatching
  const setTransfersTx = useCallback((payload: Partial<RecordTabStatus>) => {
    log('Updating received state with', payload);
    dispatchReceived({ payload, type: 'UPDATE' });
  }, []);

  const setExtrinsicsTx = useCallback((payload: Partial<RecordTabStatusGov>) => {
    log('Updating extrinsics state with', payload);
    dispatchExtrinsics({ payload, type: 'UPDATE' });
  }, []);

  // Process extrinsics
  useEffect(() => {
    if (!extrinsicsTx?.transactions?.length || !decimal) {
      return;
    }

    log(`Processing ${extrinsicsTx.transactions.length} extrinsics`);

    const extrinsicsHistoryFromSubscan: TransactionDetail[] = extrinsicsTx.transactions.map((extrinsic: Extrinsics): TransactionDetail => {
      const action = extrinsic.call_module === 'nominationpools'
        ? 'pool staking'
        : extrinsic.call_module === 'convictionvoting'
          ? 'governance'
          : extrinsic.call_module === 'staking'
            ? 'solo staking'
            : extrinsic.call_module;
      const subAction = action === 'balances' ? 'send' : formatString(extrinsic.call_module_function);
      const isAlreadyInHuman = (extrinsic.amount && extrinsic.amount.indexOf('.') >= 0) || false;
      const amount = extrinsic.amount !== undefined
        ? isAlreadyInHuman
          ? extrinsic.amount
          : (Number(extrinsic.amount) / (10 ** decimal)).toString()
        : undefined;

      return {
        action,
        amount,
        block: extrinsic.block_num,
        calls: extrinsic.calls,
        chain,
        class: extrinsic.class,
        conviction: extrinsic.conviction,
        date: extrinsic.block_timestamp * 1000, // to be consistent with locally saved times
        delegatee: extrinsic.delegatee,
        fee: extrinsic.fee,
        from: { address: extrinsic.account_display.address, name: '' },
        nominators: extrinsic.nominators,
        poolId: extrinsic.poolId,
        refId: extrinsic.refId,
        subAction,
        success: extrinsic.success,
        to: extrinsic.to ? { address: extrinsic.to, name: extrinsic.to_account_display?.display ?? '' } : undefined,
        token,
        txHash: extrinsic.extrinsic_hash,
        voteType: extrinsic.voteType
      };
    });

    log(`Processed ${extrinsicsHistoryFromSubscan.length} extrinsics`);
    setFetchedExtrinsicsHistories(extrinsicsHistoryFromSubscan);

    // Mark initial fetch as done if this is the first page
    if (extrinsicsTx.pageNum === 1 && !initialFetchDoneRef.current.extrinsics) {
      initialFetchDoneRef.current.extrinsics = true;
      log('Initial extrinsics fetch complete');
    }

    // Only set loading to false if both initial fetches are done
    if (initialFetchDoneRef.current.received && initialFetchDoneRef.current.extrinsics) {
      setIsLoading(false);
      log('All initial data loaded');
    }
  }, [decimal, extrinsicsTx.transactions, extrinsicsTx.pageNum, token, chain]);

  // Process transfer transactions
  useEffect(() => {
    if (!receivedTx?.transactions?.length) {
      return;
    }

    log(`Processing ${receivedTx.transactions.length} transfer transactions`);

    const historyFromSubscan: TransactionDetail[] = receivedTx.transactions.map((tx: Transfers): TransactionDetail => {
      const txDetail: TransactionDetail = {
        action: 'balances',
        amount: tx.amount,
        block: tx.block_num,
        chain,
        date: tx.block_timestamp * 1000, // to be consistent with locally saved times
        fee: tx.fee,
        from: { address: tx.from, name: tx.from_account_display?.display },
        subAction: 'receive',
        success: tx.success,
        to: { address: tx.to, name: tx.to_account_display?.display },
        token: tx.asset_symbol,
        txHash: tx.hash
      };

      if (txDetail.from.name?.toLowerCase().includes('reward')) {
        txDetail.action = 'pool staking';
        txDetail.subAction = 'reward';
      }

      return txDetail;
    });

    log(`Processed ${historyFromSubscan.length} transfer transactions`);
    setFetchedReceivedHistories(historyFromSubscan);

    // Mark initial fetch as done if this is the first page
    if (receivedTx.pageNum === 1 && !initialFetchDoneRef.current.received) {
      initialFetchDoneRef.current.received = true;
      log('Initial received fetch complete');
    }

    // Only set loading to false if both initial fetches are done
    if (initialFetchDoneRef.current.received && initialFetchDoneRef.current.extrinsics) {
      setIsLoading(false);
      log('All initial data loaded');
    }
  }, [chain, receivedTx.transactions, receivedTx.pageNum]);

  // Combine and filter transaction histories
  useEffect(() => {
    if (!localHistories?.length && !fetchedReceivedHistories.length && !fetchedExtrinsicsHistories.length) {
      return;
    }

    log('Combining transaction histories', {
      extrinsicsCount: fetchedExtrinsicsHistories.length,
      localCount: localHistories.length,
      receivedCount: fetchedReceivedHistories.length
    });

    // Create a Set to track transaction hashes we've already seen
    const seenTxHashes = new Set();
    const uniqueTransactions: TransactionDetail[] = [];

    // Function to add transactions to the unique list
    const addUniqueTransactions = (transactions: TransactionDetail[]) => {
      transactions.forEach((tx) => {
        if (tx.txHash && !seenTxHashes.has(tx.txHash)) {
          seenTxHashes.add(tx.txHash);
          uniqueTransactions.push(tx);
        } else if (!tx.txHash) {
          // Handle transactions without txHash (if any)
          uniqueTransactions.push(tx);
        }
      });
    };

    // Process all three arrays, prioritizing in order:
    // 1. fetchedReceivedHistories (from API)
    // 2. fetchedExtrinsicsHistories (from API)
    // 3. localHistories (from storage)
    addUniqueTransactions(fetchedReceivedHistories);
    addUniqueTransactions(fetchedExtrinsicsHistories);
    addUniqueTransactions(localHistories);

    // Sort by date (newest first)
    const sortedTransactions = uniqueTransactions.sort((a, b) => b.date - a.date);

    log(`Final history count: ${sortedTransactions.length} after deduplication`);
    setTabHistory(sortedTransactions);
  }, [fetchedExtrinsicsHistories, fetchedReceivedHistories, localHistories]);

  // Load local history from storage
  useEffect(() => {
    if (address && genesisHash) {
      log(`Loading history from storage for ${String(address)} on chain ${genesisHash}`);
      getHistoryFromStorage(String(address), String(genesisHash))
        .then((history) => {
          log(`Loaded ${history?.length || 0} transactions from storage`);
          setLocalHistories(history || []);
        })
        .catch((error) => {
          console.error('Error loading history from storage:', error);
        });
    }
  }, [address, genesisHash]);

  // Save the latest MAX_LOCAL_HISTORY_ITEMS transactions to local storage
  useEffect(() => {
    if (address && genesisHash && allHistories && allHistories.length > 0) {
      log(`Saving latest ${Math.min(MAX_LOCAL_HISTORY_ITEMS, allHistories.length)} transactions to local storage`);

      // Take the MAX_LOCAL_HISTORY_ITEMS most recent transactions
      const latestTransactions = allHistories.slice(0, MAX_LOCAL_HISTORY_ITEMS);
      const historyGenesisToSave = latestTransactions[0].chain?.genesisHash; // @AMIRKHANEF , a guard to do not save history for a wrong chain! TODO: needs an approach to avoid redundant writing

      // Save to local storage with chain information
      historyGenesisToSave && saveHistoryToStorage(String(address), historyGenesisToSave, latestTransactions)
        .then(() => {
          log('Successfully saved latest transactions to local storage');
        })
        .catch((error) => {
          console.error('Error saving history to storage:', error);
        });
    }
  }, [address, genesisHash, allHistories]);

  // Group transactions by date
  const grouped = useMemo((): Record<string, TransactionDetail[]> | null | undefined => {
    if (!allHistories?.length) {
      // If we have no items AND both transfer and extrinsics fetches are done with no more to fetch
      if (!receivedTx.hasMore && !extrinsicsTx.hasMore) {
        return null; // No items and nothing more to fetch = return null
      }

      return undefined; // Still loading or more items to fetch = return undefined
    }

    const groupedTx = {} as Record<string, TransactionDetail[]>;
    const dateOptions = { day: 'numeric', month: 'short', year: 'numeric' } as Intl.DateTimeFormatOptions;

    let filteredHistories = allHistories;

    // Apply filters if any are active
    const shouldFilter = filterOptions && !Object.values(filterOptions).every((filter) => filter);

    if (shouldFilter && filterOptions) {
      const filteredCount = allHistories.length;

      filteredHistories = allHistories.filter(({ action }) => (
        (filterOptions.transfers && ['balances'].includes(action.toLowerCase())) ||
        (filterOptions.governance && ['governance'].includes(action)) ||
        (filterOptions.staking && ['solo staking', 'pool staking'].includes(action))
      ));
      log(`Filtered transactions: ${filteredCount} -> ${filteredHistories.length}`);
    }

    filteredHistories.forEach((transaction) => {
      const day = new Date(transaction.date).toLocaleDateString(undefined, dateOptions);

      if (!groupedTx[day]) {
        groupedTx[day] = [];
      }

      groupedTx[day].push(transaction);
    });

    return groupedTx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allHistories, receivedTx.hasMore, extrinsicsTx.hasMore, filterOptions?.governance, filterOptions?.staking, filterOptions?.transfers]);

  // Fetch extrinsics
  const getExtrinsics = useCallback(async (currentState: RecordTabStatusGov): Promise<void> => {
    const { hasMore, isFetching, pageNum, transactions } = currentState;

    // Skip if either chain or chainName does not exist
    if (!chain || !chainName) {
      log('Skipping extrinsics fetch - either chain or chainName does not exist');

      return;
    }

    // Skip if no more data or already fetching
    if (isFetching || hasMore === false) {
      log('Skipping extrinsics fetch - already fetching or no more data');

      return;
    }

    log(`Fetching extrinsics history page ${pageNum}`);
    setExtrinsicsTx({
      isFetching: true
    });

    try {
      const res = await getTXsHistory(chainName, String(address), pageNum, chain.ss58Format);

      if (!requested || requested !== res?.for) {
        return;
      }

      const { count = 0, extrinsics = [] } = res.data || {};
      const nextPageNum = pageNum + 1;
      const hasMorePages = !(nextPageNum * SINGLE_PAGE_SIZE >= count) && nextPageNum < MAX_PAGE;

      log(`Received extrinsics data: count=${count}, items=${extrinsics?.length ?? 0}, hasMore=${hasMorePages}`);

      setExtrinsicsTx({
        hasMore: hasMorePages,
        isFetching: false,
        pageNum: nextPageNum,
        transactions: [...(transactions || []), ...(extrinsics || [])]
      });
    } catch (error) {
      console.error('Error fetching extrinsics history:', error);
      setExtrinsicsTx({
        hasMore: false,
        isFetching: false
      });
    }
  }, [chain, chainName, setExtrinsicsTx, address, requested]);

  // Fetch transfer transactions
  const getTransfers = useCallback(async (currentState: RecordTabStatus): Promise<void> => {
    const { hasMore, isFetching, pageNum, transactions } = currentState;

    // Skip if chainName does not exist
    if (!chainName) {
      log('Skipping received fetch - chainName does not exist');

      return;
    }

    // Skip if no more data or already fetching
    if (isFetching || hasMore === false) {
      log('Skipping received fetch - already fetching or no more data');

      return;
    }

    log(`Fetching received page ${pageNum}`);
    setTransfersTx({
      isFetching: true
    });

    try {
      const res = await getTxTransfers(chainName, String(address), pageNum, SINGLE_PAGE_SIZE);

      if (!requested || requested !== res?.for) {
        return;
      }

      const { count = 0, transfers = [] } = res.data || {};
      const nextPageNum = pageNum + 1;
      const hasMorePages = !(nextPageNum * SINGLE_PAGE_SIZE >= count) && nextPageNum < MAX_PAGE;

      log(`Received transfers data: count=${count}, items=${transfers?.length ?? 0}, hasMore=${hasMorePages}`);

      setTransfersTx({
        hasMore: hasMorePages,
        isFetching: false,
        pageNum: nextPageNum,
        transactions: [...(transactions || []), ...(transfers || [])]
      });
    } catch (error) {
      console.error('Error fetching transfers:', error);
      setTransfersTx({
        hasMore: false,
        isFetching: false,
        transactions: []
      });
    }
  }, [address, chainName, requested, setTransfersTx]);

  // Initialize data loading for a new address/chain
  useEffect(() => {
    if (address && chainName) {
      if (receivedTx.pageNum === 0 && !initialFetchInitiatedRef.current.received) {
        log('Initiating initial received fetch');
        initialFetchInitiatedRef.current.received = true;
        getTransfers(receivedStateRef.current).catch((error) => {
          console.error('Error in initial received fetch:', error);
        });
      }

      if (extrinsicsTx.pageNum === 0 && !initialFetchInitiatedRef.current.extrinsics && chain) {
        log('Initiating initial extrinsics fetch');
        initialFetchInitiatedRef.current.extrinsics = true;
        getExtrinsics(extrinsicsStateRef.current).catch((error) => {
          console.error('Error in initial extrinsics fetch:', error);
        });
      }
    }
  }, [address, chain, chainName, receivedTx.pageNum, extrinsicsTx.pageNum, getTransfers, getExtrinsics]);

  // Set up and manage the intersection observer for infinite scrolling
  useEffect(() => {
    if (!chainName || !address) {
      return;
    }

    // Clean up previous observer if it exists
    if (observerInstance.current) {
      log('Disconnecting previous observer');
      observerInstance.current.disconnect();
    }

    // Create the callback for the IntersectionObserver
    const observerCallback = (entries: IntersectionObserverEntry[]): void => {
      const [entry] = entries;

      if (!entry.isIntersecting) {
        log('Observer target not in view');

        return; // If the observer object is not in view, do nothing
      }

      log('Observer target in view, checking for more data to fetch');
      const receivedState = receivedStateRef.current;
      const extrinsicsState = extrinsicsStateRef.current;

      // Flag to track if we can fetch anything
      let canFetch = false;

      // Check transfers
      if (receivedState.hasMore && !receivedState.isFetching && !initialFetchInitiatedRef.current.received) {
        log('More received available, fetching next page');
        canFetch = true;
        getTransfers(receivedState).catch(console.error);
      } else {
        log('No more received to fetch or already fetching', {
          hasMore: receivedState.hasMore,
          isFetching: receivedState.isFetching
        });
      }

      // Check extrinsics
      if (extrinsicsState.hasMore && !extrinsicsState.isFetching && !initialFetchInitiatedRef.current.extrinsics) {
        log('More extrinsics available, fetching next page');
        canFetch = true;
        getExtrinsics(extrinsicsState).catch(console.error);
      } else {
        log('No more extrinsics to fetch or already fetching', {
          hasMore: extrinsicsState.hasMore,
          isFetching: extrinsicsState.isFetching
        });
      }

      // Disconnect observer only if both data sources are exhausted
      if (!canFetch) {
        log('No more data to fetch for either type, disconnecting observer');
        observerInstance.current?.disconnect();
      }
    };

    // Create new observer
    log('Creating new IntersectionObserver');
    const options = {
      root: document.getElementById('scrollArea'),
      rootMargin: '0px',
      threshold: 0.5 // Lower threshold to trigger earlier when scrolling
    };

    observerInstance.current = new IntersectionObserver(observerCallback, options);

    // Start observing the target if it exists
    const target = document.getElementById('observerObj');

    if (target) {
      log('Started observing target element');
      observerInstance.current.observe(target);
    } else {
      log('Warning: Observer target element not found');
    }

    // Clean up on unmount
    return () => {
      log('Cleaning up observer on unmount/rerun');
      observerInstance.current?.disconnect();
    };
  }, [address, chainName, getExtrinsics, getTransfers]);

  return {
    allHistories,
    count: allHistories?.length || 0,
    grouped,
    isLoading
  };
}
