// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';

import { useEffect, useState } from 'react';

import { getMetadata } from '../messaging';

export default function (genesisHash?: string | null, isPartial?: boolean): Chain | null | undefined {
  const [chain, setChain] = useState<Chain | null>();

  useEffect((): void => {
    if (genesisHash) {
      getMetadata(genesisHash, isPartial)
        .then(setChain)
        .catch((error): void => {
          console.error(error);
          setChain(null);
        });
    } else {
      setChain(undefined);
    }
  }, [genesisHash, isPartial]);

  return chain;
}
