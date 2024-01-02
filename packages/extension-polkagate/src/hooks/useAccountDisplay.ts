// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import useAccountName from './useAccountName';
import useMyAccountIdentity from './useMyAccountIdentity';

export default function useAccountDisplay(address: string | undefined): string | undefined {
  const [name, setName] = useState<string | undefined>();

  const accountIdentityName = useMyAccountIdentity(address)?.display;
  const accountName = useAccountName(address);

  useEffect(() => {
    if (!address) {
      setName(undefined);

      return;
    }

    if (!accountIdentityName && !accountName) {
      return;
    }

    setName(accountIdentityName ?? accountName);
  }, [accountIdentityName, accountName, address]);

  return name;
}
