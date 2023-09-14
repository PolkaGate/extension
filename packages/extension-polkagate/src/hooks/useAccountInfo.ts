// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

export default function useAccountInfo(api: ApiPromise | undefined, formatted: string | undefined, accountInfo?: DeriveAccountInfo): DeriveAccountInfo | undefined {
  const [info, setInfo] = useState<DeriveAccountInfo | undefined>();

  useEffect(() => {
    if (accountInfo && accountInfo.accountId?.toString() === formatted) {
      return setInfo(accountInfo);
    } 
    // else {
    //   setInfo(undefined);
    // }

    api && formatted && api.derive.accounts.info(formatted).then((i) => {
      setInfo(i);
    }).catch(console.error);
  }, [accountInfo, api, formatted]);

  return info;
}
