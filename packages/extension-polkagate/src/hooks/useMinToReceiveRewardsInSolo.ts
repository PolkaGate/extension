// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MinToReceiveRewardsInSolo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { useChainName, useCurrentEraIndex, useEndpoint2 } from '.';

export default function useMinToReceiveRewardsInSolo(address: string): MinToReceiveRewardsInSolo | undefined {
  const endpoint = useEndpoint2(address);
  const chainName = useChainName(address);
  const currentEraIndex = useCurrentEraIndex(address);

  const [min, setMin] = useState<MinToReceiveRewardsInSolo | undefined>();
  const [newMin, setNewMin] = useState<MinToReceiveRewardsInSolo | undefined>();

  const getMinToReceiveRewardsInSolo = useCallback((endpoint: string) => {
    const getMinToSoloWorker: Worker = new Worker(new URL('../util/workers/getMinToReceiveRewardsInSolo.js', import.meta.url));

    getMinToSoloWorker.postMessage({ endpoint });

    getMinToSoloWorker.onerror = (err) => {
      console.log(err);
    };

    getMinToSoloWorker.onmessage = (e: MessageEvent<any>) => {
      const min = e.data as MinToReceiveRewardsInSolo;
      console.log('minnnnnnnnnnnnnnnnnnnnnnnnnn:', min)
      window.localStorage.setItem(`${chainName}_minToGetRewardsInSolo`, JSON.stringify(min));
      min.minToGetRewards = new BN(min.minToGetRewards);

      setNewMin(min);
      getMinToSoloWorker.terminate();
    };
  }, [chainName]);

  useEffect(() => {
    if (!chainName) {
      return;
    }

    const saved = chainName && window.localStorage.getItem(`${chainName}_minToGetRewardsInSolo`);

    if (saved) {
      const parsedSaved = JSON.parse(saved) as MinToReceiveRewardsInSolo;

      parsedSaved.minToGetRewards = new BN(parsedSaved.minToGetRewards);
      setMin(parsedSaved);
    }
  }, [chainName]);

  useEffect(() => {
    endpoint && currentEraIndex && currentEraIndex !== min?.eraIndex && getMinToReceiveRewardsInSolo(endpoint);
  }, [currentEraIndex, endpoint, getMinToReceiveRewardsInSolo, min?.eraIndex]);

  return newMin || min;
}
