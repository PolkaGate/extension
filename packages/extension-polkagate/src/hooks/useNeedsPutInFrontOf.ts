// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import type { PutInFrontInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useEndpoint, useStashId } from '.';

export default function useNeedsPutInFrontOf(address: string): PutInFrontInfo | undefined {
  const endpoint = useEndpoint(address);
  const stashId = useStashId(address);

  const [info, setPutInFrontOfInfo] = useState<PutInFrontInfo | undefined>();

  const checkNeedsPutInFrontOf = useCallback((endpoint: string, stakerAddress: AccountId | string) => {
    const worker: Worker = new Worker(new URL('../util/workers/needsPutInFrontOf.js', import.meta.url));

    worker.postMessage({ endpoint, stakerAddress });

    worker.onerror = (err) => {
      console.log(err);
    };

    worker.onmessage = (e: MessageEvent<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const lighter: string | undefined = e.data;

      lighter && console.log('lighter to runPutInFrontOf:', lighter);

      setPutInFrontOfInfo({ lighter, shouldPutInFront: !!lighter });
      worker.terminate();
    };
  }, []);

  useEffect(() => {
    stashId && endpoint && checkNeedsPutInFrontOf(endpoint, stashId);
  }, [stashId, endpoint, checkNeedsPutInFrontOf]);

  return info;
}
