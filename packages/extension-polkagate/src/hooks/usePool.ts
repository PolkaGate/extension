// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MembersMapEntry, MyPoolInfo, NominatorInfo, PoolInfo, PoolStakingConsts, SavedMetaData, StakingConsts, Validators } from '../util/types';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { AccountContext, SettingsContext } from '../components/contexts';
import { useChain } from '.';

export default function usePool(formatted: string, id?: number): MyPoolInfo | null | undefined {
  const [myPool, setMyPool] = useState<MyPoolInfo | undefined | null>();

  const getPoolInfo = useCallback((endpoint: string, formatted: string, id: number | undefined = undefined) => {
    const getPoolWorker: Worker = new Worker(new URL('../../../util/workers/getPool.js', import.meta.url));

    getPoolWorker.postMessage({ endpoint, formatted, id });

    getPoolWorker.onerror = (err) => {
      console.log(err);
    };

    getPoolWorker.onmessage = (e: MessageEvent<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info: string = e.data;

      if (!info) {
        // setNoNominatedValidators(true);
        setMyPool(null);

        getPoolWorker.terminate();

        return;
      }

      const parsedInfo = JSON.parse(info) as MyPoolInfo;

      // setNoNominatedValidators(!parsedInfo?.stashIdAccount?.nominators?.length);

      console.log('*** My pool info returned from worker is:', parsedInfo);

      // id ? setSelectedPool(parsedInfo) :
      setMyPool(parsedInfo);
      // !id && setNominatedValidatorsId(parsedInfo?.stashIdAccount?.nominators);
      getPoolWorker.terminate();
    };
  }, []);

  useEffect(() => {
    getPoolInfo(formatted);
  }, [formatted, getPoolInfo]);

  return myPool;
}
