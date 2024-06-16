// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import { useEffect, useState } from 'react';

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useApi } from '.';

export default function useCurrentBlockNumber(address: AccountId | string | undefined): number | undefined {
  const api = useApi(address);

  const [blockNumber, setCurrentBlockNumber] = useState<number | undefined>();

  useEffect(() => {
    api && api.rpc.chain.getHeader().then((b) => setCurrentBlockNumber(b.number.unwrap().toNumber()));
  }, [api]);

  return blockNumber;
}
