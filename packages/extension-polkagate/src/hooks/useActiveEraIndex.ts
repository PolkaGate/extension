// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import { useEffect, useState } from 'react';

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useApi } from '.';

/**
 * @description This hook is going to be used for users account existing in the extension
 * */
export default function useActiveEraIndex(address: AccountId | string | undefined): number | undefined {
  const [index, setIndex] = useState<number>();
  const api = useApi(address);

  useEffect(() => {
    api && api.query.staking && api.query.staking.activeEra().then((i) => {
      setIndex(i.isSome ? i.unwrap().index.toNumber() : 0);
    }).catch(console.error);
  }, [api]);

  return index;
}

/**
 * @Details: the ActiveEra in Polkadot is the era that is currently active and operational within the network. It represents the set of active validators who are participating in the network's consensus mechanism and validating transactions. The ActiveEra is the era to which points and rewards are mapped, and it is the era where validators are actively validating blocks and contributing to the network's security and functionality.
 */
