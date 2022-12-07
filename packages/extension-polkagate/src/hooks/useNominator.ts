// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NominatorInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { useEndpoint2, useFormatted } from '.';

export default function useNominator(address: string): NominatorInfo | undefined {
  const endpoint = useEndpoint2(address);
  const formatted = useFormatted(address);

  const [nominatorInfo, setNominatorInfo] = useState<NominatorInfo | undefined>();

  const getNominatorInfo = useCallback((endpoint: string, stakerAddress: string) => {
    const getNominatorInfoWorker: Worker = new Worker(new URL('../util/workers/getNominatorInfo.js', import.meta.url));

    getNominatorInfoWorker.postMessage({ endpoint, stakerAddress });

    getNominatorInfoWorker.onerror = (err) => {
      console.log(err);
    };

    getNominatorInfoWorker.onmessage = (e: MessageEvent<any>) => {
      const nominatorInfo = e.data as NominatorInfo;

      nominatorInfo.minNominated = new BN(nominatorInfo.minNominated)

      setNominatorInfo(nominatorInfo);
      getNominatorInfoWorker.terminate();
    };
  }, []);

  useEffect(() => {
    formatted && endpoint && getNominatorInfo(endpoint, formatted);
  }, [formatted, endpoint, getNominatorInfo]);

  return nominatorInfo;
}
