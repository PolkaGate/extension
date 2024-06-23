// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useMemo } from 'react';
import { AccountContext } from '../components';

export default function useProfiles(): string [] | undefined {
  const { accounts } = useContext(AccountContext);

  return useMemo(() => {
    if(!accounts){
      return;
    }
    const profiles = accounts.map(({ profile }) => profile).filter(Boolean) as string[];
    return [...new Set(profiles)].sort();
  }, [accounts]);
}
