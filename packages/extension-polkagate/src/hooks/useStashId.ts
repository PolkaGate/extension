// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { useApi, useFormatted } from '.';

export default function useStashId(address?: AccountId | string): AccountId | string | undefined {
  const formatted = useFormatted(address);
  const api = useApi(address);
  const [stashId, setStashId] = useState<AccountId | string>();

  useEffect(() => {
    try {
      api?.query?.staking?.ledger && formatted && api.query.staking.ledger(formatted).then((res) => {
        setStashId(res?.isSome ? res?.unwrap()?.stash?.toString() : formatted);
      });
    } catch (e) {
      setStashId(undefined);
      console.error(e);
    }
  }, [api, formatted]);

  return stashId;
}
