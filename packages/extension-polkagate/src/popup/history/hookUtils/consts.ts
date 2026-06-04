// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SUBSCAN_FREE_PAGE_SIZE } from '../../../util/subscanLimits';

export const TRANSFERS_PAGE_SIZE = SUBSCAN_FREE_PAGE_SIZE;
export const EXTRINSICS_PAGE_SIZE = SUBSCAN_FREE_PAGE_SIZE;
export const MAX_LOCAL_HISTORY_ITEMS = 20; // Maximum number of items to store locally
export const DEBUG = false; // Toggle for enabling/disabling logs

export const INITIAL_STATE = {
  hasMore: true,
  isFetching: false,
  pageNum: 0,
  transactions: []
};
