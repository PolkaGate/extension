// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import useAccountName from './useAccountName';
import useMyAccountIdentity from './useMyAccountIdentity';

export default function useAccountDisplay (address: string | undefined): string | undefined {
  const [name, setName] = useState<string | undefined>();

  const accountIdentityName = useMyAccountIdentity(address)?.display;
  const accountName = useAccountName(address);

  useEffect(() => {
    if (!accountIdentityName && !accountName) {
      return;
    }

    setName(accountIdentityName ?? accountName);
  }, [accountIdentityName, accountName]);

  return name;
}
