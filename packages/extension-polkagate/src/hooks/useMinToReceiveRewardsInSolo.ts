// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MinToReceiveRewardsInSolo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { useCurrentEraIndex, useEndpoint, useToken } from '.';

export default function useMinToReceiveRewardsInSolo(address: string): MinToReceiveRewardsInSolo | undefined {
  const endpoint = useEndpoint(address);
  const token = useToken(address);
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

      min.token === token && window.localStorage.setItem(`${token}_minToGetRewardsInSolo`, JSON.stringify(min));
      min.minToGetRewards = new BN(min.minToGetRewards);

      min.token === token && setNewMin(min);
      getMinToSoloWorker.terminate();
    };
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const saved = token && window.localStorage.getItem(`${token}_minToGetRewardsInSolo`);

    if (saved) {
      const parsedSaved = JSON.parse(saved) as MinToReceiveRewardsInSolo;

      parsedSaved.minToGetRewards = new BN(parsedSaved.minToGetRewards);
      setMin(parsedSaved);
    }
  }, [token]);

  useEffect(() => {
    endpoint && currentEraIndex && currentEraIndex !== min?.eraIndex && token && getMinToReceiveRewardsInSolo(endpoint);
  }, [currentEraIndex, endpoint, getMinToReceiveRewardsInSolo, min?.eraIndex, token]);

  return newMin && newMin.token === token
    ? newMin
    : min && min.token === token
      ? min
      : undefined;
}
