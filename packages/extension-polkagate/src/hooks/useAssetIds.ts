// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { StorageKey, u32 } from '@polkadot/types';

import { useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { useApi } from '.';

export default function useAssetIds(address: AccountId | string | undefined): number[] | undefined {
  const api = useApi(address);
  const [ids, setIds] = useState<number[]>();

  useEffect(() => {
    api && api.query.assets && api.query.assets.asset.keys().then((keys: StorageKey<[u32]>[]) => {
      const _ids = keys.map(({ args: [id] }) => id.toNumber());

      setIds(_ids);
    });
  }, [api]);

  return ids;
}
