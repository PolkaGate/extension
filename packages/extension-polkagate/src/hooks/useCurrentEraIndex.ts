// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { useApi } from '.';

/** This hook is going to be used for users account existing in the extension */
export default function useCurrentEraIndex(address: AccountId | string): number | undefined {
  const [index, setIndex] = useState<number>();
  const api = useApi(address);

  useEffect(() => {
    api && api.query.staking.currentEra().then((i) => {
      setIndex(Number(i?.toString() || '0'));
    }).catch(console.error);
  }, [api]);

  return index;
}
