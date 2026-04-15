// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Extrinsics, TransactionDetail, Transfers } from '../../../util/types';

export interface RecordTabStatus {
  genesisHash?: string;
  pageNum: number;
  isFetching?: boolean;
  hasMore?: boolean;
  transactions?: Transfers[];
}

export interface RecordTabStatusGov {
  genesisHash?: string;
  pageNum: number;
  isFetching?: boolean;
  hasMore?: boolean;
  transactions?: Extrinsics[];
}

export interface TransactionHistoryOutput {
  allHistories: TransactionDetail[] | null | undefined;
  count: number;
  fetchMoreIfAvailable: () => Promise<void>;
  grouped: Record<string, TransactionDetail[]> | null | undefined;
  hasMore: boolean;
  isFetchingMore: boolean;
  isLoading: boolean;
}

export interface FilterOptions {
  transfers?: boolean;
  governance?: boolean;
  staking?: boolean;
}

export interface TransactionHistoryConfig {
  enableInfiniteScroll?: boolean;
}

// Action types for the reducers
export type ReceivedAction =
  | { type: 'RESET' }
  | { type: 'UPDATE'; payload: Partial<RecordTabStatus> };

export type ExtrinsicsAction =
  | { type: 'RESET' }
  | { type: 'UPDATE'; payload: Partial<RecordTabStatusGov> };
