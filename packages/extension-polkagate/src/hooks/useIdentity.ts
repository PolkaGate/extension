// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

export default function useIdentity(api: ApiPromise, formatted?: string): DeriveAccountInfo | undefined {
  const [identity, setIdentity] = useState<DeriveAccountInfo | undefined>();

  useEffect(() => {
    api && formatted && api.derive.accounts.info(formatted).then((i) => {
      setIdentity(i);
    });
  }, [api, formatted]);

  return identity;
}
