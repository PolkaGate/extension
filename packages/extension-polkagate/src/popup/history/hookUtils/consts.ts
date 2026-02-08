// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const SINGLE_PAGE_SIZE = 50;
export const MAX_PAGE = 10;
export const MAX_LOCAL_HISTORY_ITEMS = 20; // Maximum number of items to store locally
export const DEBUG = true; // Toggle for enabling/disabling logs

export const INITIAL_STATE = {
  hasMore: true,
  isFetching: false,
  pageNum: 0,
  transactions: []
};
