// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import useApi from './useApi';

export default function useCurrentBlockNumber (genesisHash: string | null | undefined): number | undefined {
  const api = useApi(genesisHash);

  const [blockNumber, setCurrentBlockNumber] = useState<number | undefined>();

  useEffect(() => {
    api?.rpc.chain.getHeader()
      .then((b) => setCurrentBlockNumber(b.number.unwrap().toNumber()))
      .catch(console.error);
  }, [api]);

  return blockNumber;
}
