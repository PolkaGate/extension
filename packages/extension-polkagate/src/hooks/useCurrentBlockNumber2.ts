// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { useApi2 } from '.';

export default function useCurrentBlockNumber (genesisHash: string | null | undefined): number | undefined {
  const api = useApi2(genesisHash);

  const [blockNumber, setCurrentBlockNumber] = useState<number | undefined>();

  useEffect(() => {
    api?.rpc.chain.getHeader()
      .then((b) => setCurrentBlockNumber(b.number.unwrap().toNumber()))
      .catch(console.error);
  }, [api]);

  return blockNumber;
}
