// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Auction } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { useEndpoint2 } from '.';

export default function useAuction(address: string): Auction | null | undefined {
  const endpoint = useEndpoint2(address);
  const [auction, setAuction] = useState<Auction | null>();

  const getCrowdloands = useCallback((endpoint: string) => {
    const crowdloanWorker: Worker = new Worker(new URL('../util/workers/getCrowdloans.js', import.meta.url));

    crowdloanWorker.postMessage({ endpoint });

    crowdloanWorker.onerror = (err) => {
      console.log(err);
    };

    crowdloanWorker.onmessage = (e: MessageEvent<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result: Auction = e.data;

      console.log('AuctionAuctionAuction:', result);
      setAuction(result);

      crowdloanWorker.terminate();
    };
  }, []);

  useEffect(() => {
    endpoint && getCrowdloands(endpoint);
  }, [endpoint, getCrowdloands]);

  return auction;
}
