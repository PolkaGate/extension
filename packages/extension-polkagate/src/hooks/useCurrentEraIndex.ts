// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { useApi } from '.';

/** This hook is going to be used for users account existing in the extension */
export default function useCurrentEraIndex(address: string): number | undefined {
  const [index, setIndex] = useState<number>();
  const api = useApi(address);

  useEffect(() => {
    api && api.query.staking.currentEra().then((i) => {
      setIndex(Number(i?.toString() || '0'));
    }).catch(console.error);
  }, [api]);

  return index;
}
