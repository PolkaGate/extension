// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { PutInFrontInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { AUTO_MODE } from '../util/constants';
import { useEndpoint, useStashId } from '.';

export default function useNeedsPutInFrontOf(address: string): PutInFrontInfo | undefined {
  const { endpoint } = useEndpoint(address);
  const stashId = useStashId(address);

  const [info, setPutInFrontOfInfo] = useState<PutInFrontInfo | undefined>();

  const checkNeedsPutInFrontOf = useCallback((endpoint: string, stakerAddress: AccountId | string) => {
    const worker: Worker = new Worker(new URL('../util/workers/needsPutInFrontOf.js', import.meta.url));

    worker.postMessage({ endpoint, stakerAddress });

    worker.onerror = (err) => {
      console.log(err);
    };

    worker.onmessage = (e: MessageEvent<unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const lighter = e.data as string | undefined;

      lighter && console.log('lighter to runPutInFrontOf:', lighter);

      setPutInFrontOfInfo({ lighter, shouldPutInFront: !!lighter });
      worker.terminate();
    };
  }, []);

  useEffect(() => {
    stashId && endpoint && endpoint !== AUTO_MODE.value && checkNeedsPutInFrontOf(endpoint, stashId);
  }, [stashId, endpoint, checkNeedsPutInFrontOf]);

  return info;
}
