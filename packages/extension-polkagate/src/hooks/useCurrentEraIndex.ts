// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { useApi } from '.';

/** This hook is going to be used for users account existing in the extension */
export default function useCurrentEraIndex(address: string): string | undefined {
  const [index, setIndex] = useState<string>();
  const api = useApi(address);

  useEffect(() => {
    api && api.query.staking.currentEra().then((i) => {
      setIndex(i.toString());
    }).catch(console.error);
  }, [api]);

  return index;
}
