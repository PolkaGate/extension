// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import useAccounts from './useAccounts';

export default function useLocalAccounts(): AccountJson[] {
  const localAccounts = useAccounts(({ isExternal }) => !isExternal);

  return localAccounts;
}
