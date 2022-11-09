// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { StakingConsts } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';

import { updateMeta } from '../messaging';
import { prepareMetaData } from '../util/utils';
import { useChain, useEndpoint2 } from '.';

export default function useStakingConsts(address: string): StakingConsts | null | undefined {
  const [consts, setConsts] = useState<StakingConsts | undefined | null>();
  const endpoint = useEndpoint2(address);
  const chain = useChain(address);

  const getStakingConsts = useCallback((chain: Chain, endpoint: string) => {
    const getStakingConstsWorker: Worker = new Worker(new URL('../util/workers/getStakingConsts.js', import.meta.url));

    getStakingConstsWorker.postMessage({ endpoint });

    getStakingConstsWorker.onerror = (err) => {
      console.log(err);
    };

    getStakingConstsWorker.onmessage = (e: MessageEvent<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const c: StakingConsts = e.data;

      if (c) {
        c.existentialDeposit = new BN(c.existentialDeposit);
        c.minNominatorBond = new BN(c.minNominatorBond);
        setConsts(c);

        // eslint-disable-next-line no-void
        void updateMeta(address, prepareMetaData(chain, 'stakingConsts', JSON.stringify(c)));
      } else {
        setConsts(null); // an issue while getting consts
      }

      getStakingConstsWorker.terminate();
    };
  }, [address]);

  useEffect(() => {
    endpoint && chain && getStakingConsts(chain, endpoint);
  }, [endpoint, chain, getStakingConsts]);

  return consts;
}
