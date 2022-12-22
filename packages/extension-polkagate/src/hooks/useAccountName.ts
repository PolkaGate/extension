// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { useAccount, useMyAccountIdentity } from '.';

export default function useAccountName(address: string | AccountId | undefined, withIdentity?: boolean): string | undefined {
  const [name, setName] = useState<string | undefined>();
  const account = useAccount(address);
  const info = useMyAccountIdentity(address);

  console.log("info:", info)
  useEffect((): void => {
    if (withIdentity && info?.display) {
      return setName(info.display);
    }

    address && setName(account?.name);
  }, [account, address, info?.display, withIdentity]);

  return name;
}
