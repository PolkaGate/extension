// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

export function nextDerivationPath (accounts: AccountJson[], parentAddress: string | undefined): string {
  const siblingsCount = accounts.filter((acc) => parentAddress && acc.parentAddress === parentAddress).length;

  return `//${siblingsCount}`;
}
