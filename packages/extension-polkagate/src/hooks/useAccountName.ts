// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import useAccount from './useAccount';

export default function useAccountName (address: string | AccountId | undefined): string | undefined {
  const account = useAccount(address);

  return account?.name;
}
