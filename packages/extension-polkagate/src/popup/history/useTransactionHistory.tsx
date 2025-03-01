// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Extrinsics, TransactionDetail, Transfers } from '../../util/types';

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { useInfo } from '../../hooks';
import { getGovHistory } from '../../util/api/getGovHistory';
import { getTxTransfers } from '../../util/api/getTransfers';
import { STAKING_ACTIONS } from '../../util/constants';
import { getHistoryFromStorage } from '../../util/utils';
import { TAB_MAP } from './HistoryTabs';

interface RecordTabStatus {
  pageNum: number,
  isFetching?: boolean,
  hasMore?: boolean,
  transactions?: Transfers[]
}

interface RecordTabStatusGov {
  pageNum: number,
  isFetching?: boolean,
  hasMore?: boolean,
  transactions?: Extrinsics[]
}

const SINGLE_PAGE_SIZE = 50;
const MAX_PAGE = 4;

const INITIAL_STATE = {
  hasMore: true,
  isFetching: false,
  pageNum: 0,
  transactions: []
};

export interface TransactionHistoryOutput {
  grouped: Record<string, TransactionDetail[]> | null | undefined;
  tabHistory: TransactionDetail[] | null;
  transfersTx: object & RecordTabStatus;
  governanceTx: object & RecordTabStatusGov;
}

export default function useTransactionHistory(address: string | undefined, tabIndex: TAB_MAP): TransactionHistoryOutput {
  const { chain, chainName, decimal, formatted } = useInfo(address);

  const [fetchedTransferHistoriesFromSubscan, setFetchedTransferHistoriesFromSubscan] = React.useState<TransactionDetail[] | []>([]);
  const [fetchedGovernanceHistoriesFromSubscan, setFetchedGovernanceHistoriesFromSubscan] = React.useState<TransactionDetail[] | []>([]);
  const [tabHistory, setTabHistory] = useState<TransactionDetail[] | null>([]);
  const [localHistories, setLocalHistories] = useState<TransactionDetail[]>([]);

  function stateReducer(state: object, action: RecordTabStatus) {
    return Object.assign({}, state, action);
  }

  function stateReducerGov(state: object, action: RecordTabStatusGov) {
    return Object.assign({}, state, action);
  }

  const [transfersTx, setTransfersTx] = useReducer(stateReducer, INITIAL_STATE);
  const [governanceTx, setGovernanceTx] = useReducer(stateReducerGov, INITIAL_STATE);
  const observerInstance = useRef<IntersectionObserver>();
  const receivingTransfers = useRef<RecordTabStatus>();
  const receivingGovernance = useRef<RecordTabStatusGov>();

  receivingTransfers.current = transfersTx;
  receivingGovernance.current = governanceTx;

  const grouped = useMemo((): Record<string, TransactionDetail[]> | null | undefined => {
    if (!tabHistory) {
      return undefined;
    }

    if (tabHistory.length === 0) {
      return null;
    }

    const temp = {} as Record<string, TransactionDetail[]>;
    const options = { day: 'numeric', month: 'short', year: 'numeric' } as Intl.DateTimeFormatOptions;

    tabHistory.forEach((h) => {
      const day = new Date(h.date).toLocaleDateString(undefined, options);

      if (!temp[day]) {
        temp[day] = [];
      }

      temp[day].push(h);
    });

    return temp;
  }, [tabHistory]);

  useEffect(() => {
    if (!governanceTx?.transactions?.length || !decimal) {
      return;
    }

    const govHistoryFromSubscan: TransactionDetail[] = [];

    governanceTx.transactions.forEach((govTx: Extrinsics): void => {
      govHistoryFromSubscan.push({
        action: 'Governance',
        amount: govTx.amount !== undefined ? (Number(govTx.amount) / (10 ** decimal)).toString() : undefined,
        block: govTx.block_num,
        class: govTx.class,
        conviction: govTx.conviction,
        date: govTx.block_timestamp * 1000, // to be consistent with the locally saved times
        delegatee: govTx.delegatee,
        fee: govTx.fee,
        from: { address: govTx.account_display.address, name: '' },
        refId: govTx.refId,
        subAction: govTx.call_module_function,
        success: govTx.success,
        txHash: govTx.extrinsic_hash,
        voteType: govTx.voteType
      });
    });

    setFetchedGovernanceHistoriesFromSubscan(govHistoryFromSubscan);
  }, [decimal, formatted, governanceTx.transactions, transfersTx]);

  useEffect(() => {
    if (!transfersTx?.transactions?.length) {
      return;
    }

    const historyFromSubscan: TransactionDetail[] = [];

    transfersTx.transactions.forEach((tx: Transfers): void => {
      historyFromSubscan.push({
        action: tx.from === formatted ? 'send' : 'receive',
        amount: tx.amount,
        block: tx.block_num,
        date: tx.block_timestamp * 1000, // to be consistent with the locally saved times
        fee: tx.fee,
        from: { address: tx.from, name: tx.from_account_display?.display },
        success: tx.success,
        to: { address: tx.to, name: tx.to_account_display?.display },
        token: tx.asset_symbol,
        txHash: tx.hash
      });
    });

    /** fetch some pool tx from subscan  */
    historyFromSubscan.forEach((tx) => {
      if (tx.action === 'send' && tx?.to?.name?.match(/^Pool#\d+/)) {
        tx.action = 'Pool Staking';
        tx.subAction = 'Stake';
      } else if (tx.action === 'receive') {
        if (tx?.from?.name?.match(/^Pool#([0-9]+)\(Reward\)$/)) {
          tx.action = 'Pool Staking';
          tx.subAction = 'Withdraw Rewards';
        } else if (tx?.from?.name?.match(/^Pool#\d+\(Stash\)$/)) {
          tx.action = 'Pool Staking';
          tx.subAction = 'Redeem';
        }
      }
    });

    setFetchedTransferHistoriesFromSubscan(historyFromSubscan);
  }, [formatted, transfersTx]);

  useEffect(() => {
    if (!localHistories && !fetchedTransferHistoriesFromSubscan && !fetchedGovernanceHistoriesFromSubscan) {
      return;
    }

    const filteredLocalHistories = localHistories?.filter((h1) => !fetchedTransferHistoriesFromSubscan?.find((h2) => h1.txHash === h2.txHash));
    let history = filteredLocalHistories.concat(fetchedTransferHistoriesFromSubscan).concat(fetchedGovernanceHistoriesFromSubscan);

    history = history.sort((a, b) => b.date - a.date);

    switch (tabIndex) {
      case (TAB_MAP.TRANSFERS):
        history = history.filter((h) => ['send', 'receive'].includes(h.action.toLowerCase()));
        break;
      case (TAB_MAP.STAKING):
        history = history.filter((h) => STAKING_ACTIONS.includes(h.action));
        break;
      case (TAB_MAP.GOVERNANCE):
        history = history.filter((h) => ['Governance', 'Unlock Referenda'].includes(h.action));
        break;
      default:
        break;
    }

    setTabHistory(history);
  }, [tabIndex, fetchedTransferHistoriesFromSubscan, localHistories, fetchedGovernanceHistoriesFromSubscan]);

  useEffect(() => {
    formatted && getHistoryFromStorage(String(formatted)).then((h) => {
      setLocalHistories(h || []);
    }).catch(console.error);
  }, [formatted, chainName]);

  const getGovExtrinsics = useCallback(async (outerState: RecordTabStatusGov): Promise<void> => {
    const { pageNum, transactions } = outerState;

    setGovernanceTx({
      isFetching: true,
      pageNum
    });

    const res = await getGovHistory(chainName ?? '', String(formatted), pageNum, chain?.ss58Format);

    const { count, extrinsics } = res.data || {};
    const nextPageNum = pageNum + 1;

    setGovernanceTx({
      hasMore: !(nextPageNum * SINGLE_PAGE_SIZE >= count) && nextPageNum < MAX_PAGE,
      isFetching: false,
      pageNum: nextPageNum,
      transactions: transactions?.concat(extrinsics || [])
    });
  }, [chainName, formatted, chain?.ss58Format]);

  const getTransfers = useCallback(async (outerState: RecordTabStatus): Promise<void> => {
    const { pageNum, transactions } = outerState;

    setTransfersTx({
      isFetching: true,
      pageNum
    });

    const res = await getTxTransfers(chainName ?? '', String(formatted), pageNum, SINGLE_PAGE_SIZE);

    const { count, transfers } = res.data || {};
    const nextPageNum = pageNum + 1;

    setTransfersTx({
      hasMore: !(nextPageNum * SINGLE_PAGE_SIZE >= count) && nextPageNum < MAX_PAGE,
      isFetching: false,
      pageNum: nextPageNum,
      transactions: transactions?.concat(transfers || [])
    });
  }, [formatted, chainName]);

  useEffect(() => {
    if (!chainName || !formatted) {
      return;
    }

    const observerCallback = (entries: IntersectionObserverEntry[]): void => {
      const [entry] = entries;

      if (!entry.isIntersecting) {
        return; // If the observer object is not in view, do nothing
      }

      if (receivingTransfers.current?.isFetching && receivingGovernance.current?.isFetching) {
        return; // If already fetching, do nothing
      }

      if (!receivingTransfers.current?.hasMore && !receivingTransfers.current?.hasMore) {
        observerInstance.current?.disconnect();
        console.log('No more data to load, disconnecting observer.');

        return;
      }

      getTransfers(receivingTransfers.current) // Fetch more transfers if available
        .catch((error) => {
          console.error('Error fetching transfers:', error);
        });

      receivingGovernance.current && getGovExtrinsics(receivingGovernance.current) // Fetch more governance history if available
        .catch((error) => {
          console.error('Error fetching transfers:', error);
        });
    };

    const options = {
      root: document.getElementById('scrollArea'),
      rootMargin: '0px',
      threshold: 1.0 // Trigger when 100% of the target (observerObj) is visible
    };

    observerInstance.current = new IntersectionObserver(observerCallback, options);

    const target = document.getElementById('observerObj');

    if (target) {
      observerInstance.current.observe(target); // Start observing the target
    }

    return () => {
      observerInstance.current?.disconnect();
    };
  }, [chainName, formatted, getGovExtrinsics, getTransfers, governanceTx]);

  return { governanceTx, grouped, tabHistory, transfersTx };
}
