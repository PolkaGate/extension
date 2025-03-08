// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
// @ts-nocheck

import type { AccountId } from '@polkadot/types/interfaces';
import type { Extrinsics, TransactionDetail, Transfers } from '../../util/types';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { useChainInfo, useFormatted3 } from '../../hooks';
import { getGovHistory } from '../../util/api/getGovHistory';
import { getTxTransfers } from '../../util/api/getTransfers';
import { GOVERNANCE_CHAINS, STAKING_ACTIONS } from '../../util/constants';

// Constants
const SINGLE_PAGE_SIZE = 50;
const MAX_PAGE = 10;
const MAX_LOCAL_HISTORY_ITEMS = 20; // Maximum number of items to store locally
const DEBUG = true; // Toggle for enabling/disabling logs

// Helper for consistent logging format
const log = (message: string, data?: unknown) => {
  if (DEBUG) {
    console.log(`[TxHistory] ${message}`, data !== undefined ? data : '');
  }
};

// Saves transaction history to Chrome's local storage for a specific address and chain
async function saveHistoryToStorage (address: string, genesisHash: string, transactions: TransactionDetail[]): Promise<void> {
  if (!address || !genesisHash || !transactions?.length) {
    log('Missing required parameters for saving history');

    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    try {
      log(`Saving ${transactions.length} transactions for ${address} on chain ${genesisHash}`);

      // First, get the current history object
      chrome.storage.local.get('history', (res: Record<string, unknown>) => {
        // Initialize with empty object if not exists
        const allHistories: Record<string, Record<string, TransactionDetail[]>> = (res?.history ?? {});

        // Ensure the address entry exists
        if (!allHistories[address]) {
          allHistories[address] = {};
        }

        // Update the history for this specific address and chain
        allHistories[address][genesisHash] = transactions;

        // Save the updated history object back to storage
        chrome.storage.local.set({ history: allHistories }, () => {
          if (chrome.runtime.lastError) {
            const error = chrome.runtime.lastError;

            console.error('Error saving history to chrome storage:', error);
            reject(error);
          } else {
            log('History saved successfully to chrome storage');
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Error in saveHistoryToStorage:', error);
      reject(error);
    }
  });
}

// Retrieves transaction history from Chrome's local storage for a specific address and chain
export async function getHistoryFromStorage (address: string, genesisHash: string): Promise<TransactionDetail[] | undefined> {
  if (!address || !genesisHash) {
    log('Missing required parameters for loading history');

    return Promise.resolve(undefined);
  }

  return new Promise((resolve) => {
    chrome.storage.local.get('history', (res: Record<string, unknown>) => {
      try {
        const allHistories: Record<string, Record<string, TransactionDetail[]>> = (res?.['history'] ?? {});

        // Navigate the nested structure: address -> genesisHash -> transactions
        const addressHistories: Record<string, TransactionDetail[]> = allHistories[address] || {};
        const chainHistory: TransactionDetail[] = addressHistories[genesisHash];

        log(`Retrieved ${chainHistory?.length || 0} transactions for ${address} on chain ${genesisHash}`);
        resolve(chainHistory);
      } catch (error) {
        console.error('Error retrieving history from storage:', error);
        resolve(undefined);
      }
    });
  });
}

interface RecordTabStatus {
  pageNum: number;
  isFetching?: boolean;
  hasMore?: boolean;
  transactions?: Transfers[];
}

interface RecordTabStatusGov {
  pageNum: number;
  isFetching?: boolean;
  hasMore?: boolean;
  transactions?: Extrinsics[];
}

export interface TransactionHistoryOutput {
  grouped: Record<string, TransactionDetail[]> | null | undefined;
  tabHistory: TransactionDetail[] | null;
  transfersTx: RecordTabStatus;
  governanceTx: RecordTabStatusGov;
  isLoading: boolean;
  // Helper methods for testing/debugging
  forceRefetch: () => void;
}

export interface FilterOptions {
  transfers?: boolean;
  governance?: boolean;
  staking?: boolean;
}

const INITIAL_STATE = {
  hasMore: true,
  isFetching: false,
  pageNum: 0,
  transactions: []
};

// Action types for the reducers
type TransfersAction =
  | { type: 'RESET' }
  | { type: 'UPDATE'; payload: Partial<RecordTabStatus> };

type GovernanceAction =
  | { type: 'RESET' }
  | { type: 'UPDATE'; payload: Partial<RecordTabStatusGov> };

// Reducers with reset capability
const transfersReducer = (state: RecordTabStatus, action: TransfersAction): RecordTabStatus => {
  switch (action.type) {
    case 'RESET':
      log('Resetting transfers state');

      return INITIAL_STATE as RecordTabStatus;
    case 'UPDATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

const governanceReducer = (state: RecordTabStatusGov, action: GovernanceAction): RecordTabStatusGov => {
  switch (action.type) {
    case 'RESET':
      log('Resetting governance state');

      return INITIAL_STATE as RecordTabStatusGov;
    case 'UPDATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default function useTransactionHistory (address: AccountId | string | undefined, genesisHash: string | undefined, filterOptions?: FilterOptions): TransactionHistoryOutput {
  const { chain, chainName, decimal, token } = useChainInfo(genesisHash);
  const formatted = useFormatted3(address, genesisHash);
  const [isLoading, setIsLoading] = useState(false);

  const [fetchedTransferHistories, setFetchedTransferHistories] = useState<TransactionDetail[]>([]);
  const [fetchedGovernanceHistories, setFetchedGovernanceHistories] = useState<TransactionDetail[]>([]);
  const [tabHistory, setTabHistory] = useState<TransactionDetail[] | null>([]);
  const [localHistories, setLocalHistories] = useState<TransactionDetail[]>([]);

  // Previous values for comparison to detect changes
  const prevAddressRef = useRef<string | undefined>();
  const prevGenesisHashRef = useRef<string | undefined>();

  // Force refetch trigger
  const forceRefetchTrigger = useRef(0);

  const [transfersTx, dispatchTransfers] = useReducer(transfersReducer, INITIAL_STATE as RecordTabStatus);
  const [governanceTx, dispatchGovernance] = useReducer(governanceReducer, INITIAL_STATE as RecordTabStatusGov);

  // Refs for latest state values
  const transfersStateRef = useRef<RecordTabStatus>(transfersTx);
  const governanceStateRef = useRef<RecordTabStatusGov>(governanceTx);
  const observerInstance = useRef<IntersectionObserver>();
  const initialFetchDoneRef = useRef<{ transfers: boolean; governance: boolean }>({
    governance: false,
    transfers: false
  });

  // Helper method to force a refetch (useful for debugging)
  const forceRefetch = useCallback(() => {
    log('Force refetch triggered');
    forceRefetchTrigger.current += 1;
  }, []);

  // Detect changes in address or genesisHash to reset state
  useEffect(() => {
    const addressChanged = formatted !== prevAddressRef.current;
    const genesisHashChanged = genesisHash !== prevGenesisHashRef.current;

    if (addressChanged || genesisHashChanged) {
      log(`Input changed: address: ${addressChanged}, genesisHash: ${genesisHashChanged}`);

      // Update refs to current values
      prevAddressRef.current = formatted;
      prevGenesisHashRef.current = genesisHash;

      if (formatted && genesisHash) {
        // Reset all state when address or chain changes
        setIsLoading(true);
        dispatchTransfers({ type: 'RESET' });
        dispatchGovernance({ type: 'RESET' });
        setFetchedTransferHistories([]);
        setFetchedGovernanceHistories([]);
        setTabHistory([]);
        setLocalHistories([]);

        // Reset initial fetch status
        initialFetchDoneRef.current = {
          governance: false,
          transfers: false
        };

        log('All state reset due to input change');
      }
    }
  }, [formatted, genesisHash]);

  // Keep refs updated with latest state values
  useEffect(() => {
    transfersStateRef.current = transfersTx;
    log('Transfers state updated', { ...transfersTx });
  }, [transfersTx]);

  useEffect(() => {
    governanceStateRef.current = governanceTx;
    log('Governance state updated', { ...governanceTx });
  }, [governanceTx]);

  // Convenience functions for dispatching
  const setTransfersTx = useCallback((payload: Partial<RecordTabStatus>) => {
    log('Updating transfers state with', payload);
    dispatchTransfers({ payload, type: 'UPDATE' });
  }, []);

  const setGovernanceTx = useCallback((payload: Partial<RecordTabStatusGov>) => {
    log('Updating governance state with', payload);
    dispatchGovernance({ payload, type: 'UPDATE' });
  }, []);

  // Process governance transactions
  useEffect(() => {
    if (!governanceTx?.transactions?.length || !decimal) {
      return;
    }

    log(`Processing ${governanceTx.transactions.length} governance transactions`);

    const govHistoryFromSubscan: TransactionDetail[] = governanceTx.transactions.map((govTx: Extrinsics): TransactionDetail => ({
      action: 'Governance',
      amount: govTx.amount !== undefined ? (Number(govTx.amount) / (10 ** decimal)).toString() : undefined,
      block: govTx.block_num,
      class: govTx.class,
      conviction: govTx.conviction,
      date: govTx.block_timestamp * 1000, // to be consistent with locally saved times
      delegatee: govTx.delegatee,
      fee: govTx.fee,
      from: { address: govTx.account_display.address, name: '' },
      refId: govTx.refId,
      subAction: govTx.call_module_function,
      success: govTx.success,
      token,
      txHash: govTx.extrinsic_hash,
      voteType: govTx.voteType
    }));

    log(`Processed ${govHistoryFromSubscan.length} governance transactions`);
    setFetchedGovernanceHistories(govHistoryFromSubscan);

    // Mark initial fetch as done if this is the first page
    if (governanceTx.pageNum === 1 && !initialFetchDoneRef.current.governance) {
      initialFetchDoneRef.current.governance = true;
      log('Initial governance fetch complete');
    }

    // Only set loading to false if both initial fetches are done
    if (initialFetchDoneRef.current.transfers && initialFetchDoneRef.current.governance) {
      setIsLoading(false);
      log('All initial data loaded');
    }
  }, [decimal, governanceTx.transactions, governanceTx.pageNum, token]);

  // Process transfer transactions
  useEffect(() => {
    if (!transfersTx?.transactions?.length || !formatted) {
      return;
    }

    log(`Processing ${transfersTx.transactions.length} transfer transactions`);

    const historyFromSubscan: TransactionDetail[] = transfersTx.transactions.map((tx: Transfers): TransactionDetail => {
      const isFromCurrentAccount = tx.from === formatted;
      const txDetail: TransactionDetail = {
        action: isFromCurrentAccount ? 'send' : 'receive',
        amount: tx.amount,
        block: tx.block_num,
        date: tx.block_timestamp * 1000, // to be consistent with locally saved times
        fee: tx.fee,
        from: { address: tx.from, name: tx.from_account_display?.display },
        success: tx.success,
        to: { address: tx.to, name: tx.to_account_display?.display },
        token: tx.asset_symbol,
        txHash: tx.hash
      };

      // Handle pool transactions
      if (isFromCurrentAccount && tx?.to?.name?.match(/^Pool#\d+/)) {
        txDetail.action = 'Pool Staking';
        txDetail.subAction = 'Stake';
      } else if (!isFromCurrentAccount) {
        if (tx?.from?.name?.match(/^Pool#([0-9]+)\(Reward\)$/)) {
          txDetail.action = 'Pool Staking';
          txDetail.subAction = 'Withdraw Rewards';
        } else if (tx?.from?.name?.match(/^Pool#\d+\(Stash\)$/)) {
          txDetail.action = 'Pool Staking';
          txDetail.subAction = 'Redeem';
        }
      }

      return txDetail;
    });

    log(`Processed ${historyFromSubscan.length} transfer transactions`);
    setFetchedTransferHistories(historyFromSubscan);

    // Mark initial fetch as done if this is the first page
    if (transfersTx.pageNum === 1 && !initialFetchDoneRef.current.transfers) {
      initialFetchDoneRef.current.transfers = true;
      log('Initial transfers fetch complete');
    }

    // Only set loading to false if both initial fetches are done
    if (initialFetchDoneRef.current.transfers && initialFetchDoneRef.current.governance) {
      setIsLoading(false);
      log('All initial data loaded');
    }
  }, [formatted, transfersTx.transactions, transfersTx.pageNum]);

  // Combine and filter transaction histories
  useEffect(() => {
    if (!localHistories && !fetchedTransferHistories.length && !fetchedGovernanceHistories.length) {
      return;
    }

    log('Combining transaction histories', {
      governanceCount: fetchedGovernanceHistories.length,
      localCount: localHistories.length,
      transfersCount: fetchedTransferHistories.length
    });

    // Filter out duplicate transactions from local history that already exist in fetched history
    const filteredLocalHistories = localHistories.filter(
      (local) => !fetchedTransferHistories.some((fetched) => local.txHash === fetched.txHash)
    );

    // Combine all histories and sort by date (newest first)
    let combinedHistory = [...filteredLocalHistories, ...fetchedTransferHistories, ...fetchedGovernanceHistories]
      .sort((a, b) => b.date - a.date);

    // Apply filters if any are active
    const shouldFilter = filterOptions && !Object.values(filterOptions).every((filter) => filter);

    if (shouldFilter && filterOptions) {
      const filteredCount = combinedHistory.length;

      combinedHistory = combinedHistory.filter(({ action }) => (
        (filterOptions.transfers && ['send', 'receive'].includes(action.toLowerCase())) ||
        (filterOptions.governance && ['Governance', 'Unlock Referenda'].includes(action)) ||
        (filterOptions.staking && STAKING_ACTIONS.includes(action))
      ));
      log(`Filtered transactions: ${filteredCount} -> ${combinedHistory.length}`);
    }

    log(`Final history count: ${combinedHistory.length}`);
    setTabHistory(combinedHistory);
  }, [fetchedGovernanceHistories, fetchedTransferHistories, filterOptions, filterOptions?.governance, filterOptions?.staking, filterOptions?.transfers, localHistories]);

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

  // Save the latest 20 transactions to local storage
  useEffect(() => {
    if (address && genesisHash && tabHistory && tabHistory.length > 0) {
      log(`Saving latest ${Math.min(MAX_LOCAL_HISTORY_ITEMS, tabHistory.length)} transactions to local storage`);

      // Take the 20 most recent transactions
      const latestTransactions = tabHistory.slice(0, MAX_LOCAL_HISTORY_ITEMS);

      // Save to local storage with chain information
      saveHistoryToStorage(String(address), String(genesisHash), latestTransactions)
        .then(() => {
          log('Successfully saved latest transactions to local storage');
        })
        .catch((error) => {
          console.error('Error saving history to storage:', error);
        });
    }
  }, [address, genesisHash, tabHistory]);

  // Group transactions by date
  const grouped = useMemo((): Record<string, TransactionDetail[]> | null | undefined => {
    if (!tabHistory?.length) {
      // If we have no items AND both transfer and governance fetches are done with no more to fetch
      if (
        !transfersTx.hasMore &&
        !governanceTx.hasMore
      ) {
        return null; // No items and nothing more to fetch = return null
      }

      return undefined; // Still loading or more items to fetch = return undefined
    }

    const groupedTx = {} as Record<string, TransactionDetail[]>;
    const dateOptions = { day: 'numeric', month: 'short', year: 'numeric' } as Intl.DateTimeFormatOptions;

    tabHistory.forEach((transaction) => {
      const day = new Date(transaction.date).toLocaleDateString(undefined, dateOptions);

      if (!groupedTx[day]) {
        groupedTx[day] = [];
      }

      groupedTx[day].push(transaction);
    });

    return groupedTx;
  }, [tabHistory, transfersTx.hasMore, governanceTx.hasMore]);

  // Fetch governance extrinsics
  const getGovExtrinsics = useCallback(async (currentState: RecordTabStatusGov): Promise<void> => {
    const { hasMore, isFetching, pageNum, transactions } = currentState;

    // Skip if no more data or already fetching
    if (isFetching || hasMore === false) {
      log('Skipping governance fetch - already fetching or no more data');

      return;
    }

    if (GOVERNANCE_CHAINS.includes(genesisHash ?? '') === false) {
      setGovernanceTx({
        hasMore: false,
        isFetching: false,
        transactions: []
      });

      log('Skipping governance fetch - unsupported chain');

      return;
    }

    log(`Fetching governance history page ${pageNum}`);
    setGovernanceTx({
      isFetching: true
    });

    try {
      const res = await getGovHistory(chainName ?? '', String(formatted), pageNum, chain?.ss58Format);
      const { count = 0, extrinsics = [] } = res.data || {};
      const nextPageNum = pageNum + 1;
      const hasMorePages = !(nextPageNum * SINGLE_PAGE_SIZE >= count) && nextPageNum < MAX_PAGE;

      log(`Received governance data: count=${count}, items=${extrinsics?.length ?? 0}, hasMore=${hasMorePages}`);

      setGovernanceTx({
        hasMore: hasMorePages,
        isFetching: false,
        pageNum: nextPageNum,
        transactions: [...(transactions || []), ...(extrinsics || [])]
      });
    } catch (error) {
      console.error('Error fetching governance history:', error);
      setGovernanceTx({
        hasMore: false,
        isFetching: false
      });
    }
  }, [genesisHash, setGovernanceTx, chainName, formatted, chain?.ss58Format]);

  // Fetch transfer transactions
  const getTransfers = useCallback(async (currentState: RecordTabStatus): Promise<void> => {
    const { hasMore, isFetching, pageNum, transactions } = currentState;

    // Skip if no more data or already fetching
    if (isFetching || hasMore === false) {
      log('Skipping transfers fetch - already fetching or no more data');

      return;
    }

    log(`Fetching transfers page ${pageNum}`);
    setTransfersTx({
      isFetching: true
    });

    try {
      const res = await getTxTransfers(chainName ?? '', String(formatted), pageNum, SINGLE_PAGE_SIZE);
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
  }, [chainName, formatted, setTransfersTx]);

  // Initialize data loading for a new address/chain
  useEffect(() => {
    if (formatted && chainName) {
      if (transfersTx.pageNum === 0) {
        log('Initiating initial transfers fetch');
        getTransfers(transfersStateRef.current).catch((error) => {
          console.error('Error in initial transfers fetch:', error);
        });
      }

      if (governanceTx.pageNum === 0) {
        log('Initiating initial governance fetch');
        getGovExtrinsics(governanceStateRef.current).catch((error) => {
          console.error('Error in initial governance fetch:', error);
        });
      }
    }
  }, [chainName, formatted, transfersTx.pageNum, governanceTx.pageNum, getTransfers, getGovExtrinsics]);

  // Force refetch effect
  useEffect(() => {
    if (forceRefetchTrigger.current > 0) {
      log('Force refetch triggered, resetting and refetching data');

      // Reset fetch state but keep accumulated data
      if (transfersStateRef.current.hasMore) {
        getTransfers(transfersStateRef.current).catch(console.error);
      }

      if (governanceStateRef.current.hasMore) {
        getGovExtrinsics(governanceStateRef.current).catch(console.error);
      }
    }
  }, [getGovExtrinsics, getTransfers]);

  // Set up and manage the intersection observer for infinite scrolling
  useEffect(() => {
    if (!chainName || !formatted) {
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
      const transfersState = transfersStateRef.current;
      const governanceState = governanceStateRef.current;

      // Flag to track if we can fetch anything
      let canFetch = false;

      // Check transfers
      if (transfersState.hasMore && !transfersState.isFetching) {
        log('More transfers available, fetching next page');
        canFetch = true;
        getTransfers(transfersState).catch(console.error);
      } else {
        log('No more transfers to fetch or already fetching', {
          hasMore: transfersState.hasMore,
          isFetching: transfersState.isFetching
        });
      }

      // Check governance
      if (governanceState.hasMore && !governanceState.isFetching) {
        log('More governance data available, fetching next page');
        canFetch = true;
        getGovExtrinsics(governanceState).catch(console.error);
      } else {
        log('No more governance data to fetch or already fetching', {
          hasMore: governanceState.hasMore,
          isFetching: governanceState.isFetching
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
  }, [chainName, formatted, getGovExtrinsics, getTransfers]);

  return {
    forceRefetch,
    governanceTx,
    grouped,
    isLoading,
    tabHistory,
    transfersTx
  };
}
