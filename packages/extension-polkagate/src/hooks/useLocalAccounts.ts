// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { useContext, useMemo } from 'react';

import { AccountContext } from '../components';

export default function useLocalAccounts (): AccountJson[] {
  const { accounts } = useContext(AccountContext);

 return useMemo(
    () => accounts.filter(({ isExternal }) => !isExternal),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accounts?.length]
  );
}
