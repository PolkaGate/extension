// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

export const sortAccounts = (accountA: AccountJson, accountB: AccountJson, selectedList: string[]): number => {
  const isASelected = selectedList.includes(accountA.address);
  const isBSelected = selectedList.includes(accountB.address);

  if (!isASelected && isBSelected) {
    return -1;
  } else if (isASelected && !isBSelected) {
    return 1;
  }

  return 0;
};
