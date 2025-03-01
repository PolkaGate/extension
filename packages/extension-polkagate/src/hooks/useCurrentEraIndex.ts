// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useEffect, useState } from 'react';

import { useApi } from '.';

/** This hook is going to be used for users account existing in the extension */
export default function useCurrentEraIndex(address: AccountId | string | undefined): number | undefined {
  const [index, setIndex] = useState<number>();
  const api = useApi(address);

  useEffect(() => {
    api?.query['staking']?.['currentEra']().then((i) => {
      setIndex(Number(i?.toString() || '0'));
    }).catch(console.error);
  }, [api]);

  return index;
}

/**
 * @details
 *  The CurrentEra in Polkadot refers to the latest planned era within the network. It represents the era that is currently being prepared for and is the next era in line to become active. The CurrentEra is used to queue up all the election winners for the next era ahead of time, allowing the system to prepare for the transition of validators and ensure a smooth process for the next era.
 */
