// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolStakingConsts } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { sanitizeChainName } from '../util/utils';
import { useChain, useCurrentEraIndex, useEndpoint2, useToken } from '.';

export default function usePoolConsts(address: string, stateConsts?: PoolStakingConsts): PoolStakingConsts | null | undefined {
  const [consts, setConsts] = useState<PoolStakingConsts | undefined | null>();
  const [newConsts, setNewConsts] = useState<PoolStakingConsts | undefined | null>();
  const endpoint = useEndpoint2(address);
  const chain = useChain(address);
  const token = useToken(address);
  const eraIndex = useCurrentEraIndex(address);

  const chainName = sanitizeChainName(chain?.name);

  const getPoolStakingConsts = useCallback((endpoint: string) => {
    const getPoolStakingConstsWorker: Worker = new Worker(new URL('../util/workers/getPoolStakingConsts.js', import.meta.url));

    getPoolStakingConstsWorker.postMessage({ endpoint });

    getPoolStakingConstsWorker.onerror = (err) => {
      console.log(err);
    };

    getPoolStakingConstsWorker.onmessage = (e: MessageEvent<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const c: PoolStakingConsts = e.data;

      if (c) {
        window.localStorage.setItem(`${chainName}_poolConsts`, JSON.stringify(c));

        c.lastPoolId = new BN(c.lastPoolId);
        c.minCreateBond = new BN(c.minCreateBond);
        c.minCreationBond = new BN(c.minCreationBond);
        c.minJoinBond = new BN(c.minJoinBond);
        c.minNominatorBond = new BN(c.minNominatorBond);

        setNewConsts(c);
      } else {
        setNewConsts(null);
      }

      getPoolStakingConstsWorker.terminate();
    };
  }, [chainName]);

  useEffect(() => {
    if (!chainName) {
      return;
    }

    const localSavedPoolConsts = chainName && window.localStorage.getItem(`${chainName}_poolConsts`);

    if (localSavedPoolConsts) {
      const parsedConsts = JSON.parse(localSavedPoolConsts) as PoolStakingConsts;

      parsedConsts.lastPoolId = new BN(parsedConsts.lastPoolId);
      parsedConsts.minCreateBond = new BN(parsedConsts.minCreateBond);
      parsedConsts.minCreationBond = new BN(parsedConsts.minCreationBond);
      parsedConsts.minJoinBond = new BN(parsedConsts.minJoinBond);
      parsedConsts.minNominatorBond = new BN(parsedConsts.minNominatorBond);

      setConsts(parsedConsts);
    }
  }, [chainName]);

  useEffect(() => {
    if (stateConsts) {
      return setConsts(stateConsts);
    }

    endpoint && chain && eraIndex && eraIndex !== consts?.eraIndex && getPoolStakingConsts(endpoint);
  }, [endpoint, chain, getPoolStakingConsts, stateConsts, eraIndex, consts?.eraIndex]);

  return (newConsts && newConsts.token === token)
    ? newConsts
    : (consts && consts.token === token)
      ? consts
      : undefined;
}
