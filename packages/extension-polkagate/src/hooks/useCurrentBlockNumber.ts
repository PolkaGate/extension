// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { useApi } from '.';

export default function useCurrentBlockNumber(address: AccountId | string | undefined): number | undefined {
  const api = useApi(address);

  const [blockNumber, setCurrentBlockNumber] = useState<number | undefined>();

  useEffect(() => {
    api && api.rpc.chain.getHeader().then((b) => setCurrentBlockNumber(b.number.unwrap()));
  }, [api]);

  return blockNumber;
}
