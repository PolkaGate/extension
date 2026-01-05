// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import useChainInfo from './useChainInfo';

interface ActiveEraType {
  index: number;
  start: number;
}

/**
 * @description This hook is going to be used for users account existing in the extension
 * */
export default function useActiveEraIndex (genesisHash: string | undefined): number | undefined {
  const [index, setIndex] = useState<number>();
  const { api } = useChainInfo(genesisHash);

  useEffect(() => {
    api?.query['staking']?.['activeEra']().then((i) => {
      if (i.isEmpty) {
        return setIndex(0);
      } else {
        const activeEra = i.toPrimitive() as unknown as ActiveEraType;

        return setIndex(Number(activeEra.index));
      }
    }).catch(console.error);
  }, [api]);

  return index;
}

/**
 * @Details: the ActiveEra in Polkadot is the era that is currently active and operational within the network. It represents the set of active validators who are participating in the network's consensus mechanism and validating transactions. The ActiveEra is the era to which points and rewards are mapped, and it is the era where validators are actively validating blocks and contributing to the network's security and functionality.
 */
