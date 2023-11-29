// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { StakingConsts } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { useChainName, useCurrentEraIndex, useEndpoint, useToken } from '.';

export default function useStakingConsts(address: string, stateConsts?: StakingConsts): StakingConsts | null | undefined {
  const [savedConsts, setSavedConsts] = useState<StakingConsts | undefined | null>();
  const [newConsts, setNewConsts] = useState<StakingConsts | undefined | null>();
  const endpoint = useEndpoint(address);
  const chainName = useChainName(address);
  const eraIndex = useCurrentEraIndex(address);
  const token = useToken(address);

  const getStakingConsts = useCallback((chainName: string, endpoint: string) => {
    const getStakingConstsWorker: Worker = new Worker(new URL('../util/workers/getStakingConsts.js', import.meta.url));

    getStakingConstsWorker.postMessage({ endpoint });

    getStakingConstsWorker.onerror = (err) => {
      console.log(err);
    };

    getStakingConstsWorker.onmessage = (e: MessageEvent<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const c: StakingConsts = e.data;

      if (c) {
        window.localStorage.setItem(`${chainName}_stakingConsts`, JSON.stringify(c));

        c.existentialDeposit = new BN(c.existentialDeposit);
        c.minNominatorBond = new BN(c.minNominatorBond);
        setNewConsts(c);
      } else {
        setNewConsts(null); // an issue while getting consts
      }

      getStakingConstsWorker.terminate();
    };
  }, []);

  useEffect(() => {
    if (!chainName) {
      return;
    }

    const localSavedStakingConsts = chainName && window.localStorage.getItem(`${chainName}_stakingConsts`);

    if (localSavedStakingConsts) {
      const parsedConsts = JSON.parse(localSavedStakingConsts) as StakingConsts;

      parsedConsts.existentialDeposit = new BN(parsedConsts.existentialDeposit);
      parsedConsts.minNominatorBond = new BN(parsedConsts.minNominatorBond);

      setSavedConsts(parsedConsts);
    }
  }, [chainName]);

  useEffect(() => {
    if (stateConsts) {
      return setSavedConsts(stateConsts);
    }

    const isSavedVersionOutOfDate = eraIndex !== savedConsts?.eraIndex;

    endpoint && chainName && eraIndex && isSavedVersionOutOfDate && getStakingConsts(chainName, endpoint);
  }, [endpoint, chainName, getStakingConsts, stateConsts, eraIndex, savedConsts]);

  return (newConsts && newConsts.token === token)
    ? newConsts
    : (savedConsts && savedConsts.token === token)
      ? savedConsts
      : undefined;
}
