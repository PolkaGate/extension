// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useEffect, useState } from 'react';

import { useApi } from '.';

export default function useCurrentBlockNumber(address: AccountId | string | undefined): number | undefined {
  const api = useApi(address);

  const [blockNumber, setCurrentBlockNumber] = useState<number | undefined>();

  useEffect(() => {
    api?.rpc.chain.getHeader()
      .then((b) => setCurrentBlockNumber(b.number.unwrap().toNumber()))
      .catch(console.error);
  }, [api]);

  return blockNumber;
}
