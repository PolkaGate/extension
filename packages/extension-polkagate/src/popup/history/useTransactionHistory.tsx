// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TransactionDetail, Transfers } from '../../util/types';

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { useInfo } from '../../hooks';
import { getTxTransfers } from '../../util/api/getTransfers';
import { STAKING_ACTIONS } from '../../util/constants';
import { getHistoryFromStorage } from '../../util/utils';

enum TAB_MAP {
  ALL,
  TRANSFERS,
  STAKING
}

interface RecordTabStatus {
  pageNum: number,
  isFetching?: boolean,
  hasMore?: boolean,
  transactions?: Transfers[]
}

const SINGLE_PAGE_SIZE = 50;
const MAX_PAGE = 4;

const INITIAL_STATE = {
  hasMore: true,
  isFetching: false,
  pageNum: 0,
  transactions: []
};

export interface TransactionHistoryOutput{
  grouped: Record<string, TransactionDetail[]> | null | undefined;
  tabHistory: TransactionDetail[] | null
  transfersTx: object & RecordTabStatus
}

export default function useTransactionHistory (address: string | undefined, tabIndex: TAB_MAP): TransactionHistoryOutput {
  const { chainName, formatted } = useInfo(address);

  const [fetchedHistoriesFromSubscan, setFetchedHistoriesFromSubscan] = React.useState<TransactionDetail[] | []>([]);
  const [tabHistory, setTabHistory] = useState<TransactionDetail[] | null>([]);
  const [localHistories, setLocalHistories] = useState<TransactionDetail[]>([]);

  function stateReducer (state: object, action: RecordTabStatus) {
    return Object.assign({}, state, action);
  }

  const [transfersTx, setTransfersTx] = useReducer(stateReducer, INITIAL_STATE);
  const observerInstance = useRef<IntersectionObserver>();
  const receivingTransfers = useRef<RecordTabStatus>();

  receivingTransfers.current = transfersTx;

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

    setFetchedHistoriesFromSubscan(historyFromSubscan);
  }, [formatted, transfersTx]);

  useEffect(() => {
    if (!localHistories && !fetchedHistoriesFromSubscan) {
      return;
    }

    const filteredLocalHistories = localHistories?.filter((h1) => !fetchedHistoriesFromSubscan?.find((h2) => h1.txHash === h2.txHash));
    let history = filteredLocalHistories.concat(fetchedHistoriesFromSubscan);

    history = history.sort((a, b) => b.date - a.date);

    switch (tabIndex) {
      case (TAB_MAP.TRANSFERS):
        history = history.filter((h) => ['send', 'receive'].includes(h.action.toLowerCase()));
        break;
      case (TAB_MAP.STAKING):
        history = history.filter((h) => STAKING_ACTIONS.includes(h.action));
        break;
      default:
        break;
    }

    setTabHistory(history);
  }, [tabIndex, fetchedHistoriesFromSubscan, localHistories]);

  useEffect(() => {
    formatted && getHistoryFromStorage(String(formatted)).then((h) => {
      setLocalHistories(h || []);
    }).catch(console.error);
  }, [formatted, chainName]);

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

    const observerCallback = async (entries: IntersectionObserverEntry[]): Promise<void> => {
      const [entry] = entries;

      if (!entry.isIntersecting) {
        return; // If the observer object is not in view, do nothing
      }

      if (receivingTransfers.current?.isFetching) {
        return; // If already fetching, do nothing
      }

      if (!receivingTransfers.current?.hasMore) {
        observerInstance.current?.disconnect();
        console.log('No more data to load, disconnecting observer.');

        return;
      }

      await getTransfers(receivingTransfers.current); // Fetch more transfers if available
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
  }, [chainName, formatted, getTransfers]);

  return { grouped, tabHistory, transfersTx };
}
