// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolStakingConsts } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';

import { updateMeta } from '../messaging';
import { prepareMetaData } from '../util/utils';
import { useChain, useEndpoint2 } from '.';

export default function usePoolConsts(address: string, stateConsts?: PoolStakingConsts): PoolStakingConsts | null | undefined {
  const [consts, setConsts] = useState<PoolStakingConsts | undefined | null>();
  const endpoint = useEndpoint2(address);
  const chain = useChain(address);

  const getPoolStakingConsts = useCallback((chain: Chain, endpoint: string) => {
    const getPoolStakingConstsWorker: Worker = new Worker(new URL('../util/workers/getPoolStakingConsts.js', import.meta.url));

    getPoolStakingConstsWorker.postMessage({ endpoint });

    getPoolStakingConstsWorker.onerror = (err) => {
      console.log(err);
    };

    getPoolStakingConstsWorker.onmessage = (e: MessageEvent<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const c: PoolStakingConsts = e.data;

      if (c) {
        c.lastPoolId = new BN(c.lastPoolId);
        c.minCreateBond = new BN(c.minCreateBond);
        c.minCreationBond = new BN(c.minCreationBond);
        c.minJoinBond = new BN(c.minJoinBond);
        c.minNominatorBond = new BN(c.minNominatorBond);

        setConsts(c);

        console.log('poolStakingConst:', c);

        // eslint-disable-next-line no-void
        void updateMeta(address, prepareMetaData(chain, 'poolStakingConsts', JSON.stringify(c)));
      } else {
        setConsts(null);
      }

      getPoolStakingConstsWorker.terminate();
    };
  }, [address]);

  useEffect(() => {
    if (stateConsts) {
      return setConsts(stateConsts);
    }

    endpoint && chain && getPoolStakingConsts(chain, endpoint);
  }, [endpoint, chain, getPoolStakingConsts, stateConsts]);

  return consts;
}
