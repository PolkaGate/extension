// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RebagInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { useEndpoint, useStashId } from '.';

export default function useNeedsRebag(address: string): RebagInfo | undefined {
  const endpoint = useEndpoint(address);
  const stashId = useStashId(address);

  const [info, setRebagInfo] = useState<RebagInfo | undefined>();

  const checkNeedsRebag = useCallback((endpoint: string, stakerAddress: AccountId | string) => {
    const worker: Worker = new Worker(new URL('../util/workers/needsRebag.js', import.meta.url));

    worker.postMessage({ endpoint, stakerAddress });

    worker.onerror = (err) => {
      console.log(err);
    };

    worker.onmessage = (e: MessageEvent<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info: RebagInfo | undefined = e.data;

      setRebagInfo(info);

      worker.terminate();
    };
  }, []);

  useEffect(() => {
    stashId && endpoint && checkNeedsRebag(endpoint, stashId);
  }, [stashId, endpoint, checkNeedsRebag]);

  return info;
}
