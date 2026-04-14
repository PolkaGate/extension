// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { mapSystemToRelay } from '../util/migrateHubUtils';
import useApi from './useApi';

interface UseCurrentBlockNumberOptions {
  relay?: boolean;
}

export default function useCurrentBlockNumber(genesisHash: string | null | undefined, { relay = false }: UseCurrentBlockNumberOptions = {}): number | undefined {
 const resolvedGenesisHash = relay ? mapSystemToRelay(genesisHash) : genesisHash;
  const api = useApi(resolvedGenesisHash);

  const [blockNumber, setCurrentBlockNumber] = useState<number | undefined>();

  useEffect(() => {
    api?.rpc.chain.getHeader()
      .then((b) => setCurrentBlockNumber(b.number.unwrap().toNumber()))
      .catch(console.error);
  }, [api]);

  return blockNumber;
}
