// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';
import { BN } from '@polkadot/util';

import { isHexToBn } from '../util/utils';

export type AssetsOnOtherChains = { assetId?: number, totalBalance: BN, chainName: string, decimal: number, genesisHash: string, price: number | undefined, token: string };

export default function useAssetsOnChains(address: AccountId | string | undefined, assets?: AssetsOnOtherChains[] | undefined | null): AssetsOnOtherChains[] | undefined | null {
  const [assetsOnOtherChains, setAssetsOnOtherChains] = useState<AssetsOnOtherChains[] | undefined | null>();
  const [workerCalled, setWorkerCalled] = useState<{ address: string, worker: Worker }>();

  const readAssetsOnOtherChains = useCallback((addressA: string) => {
    chrome.storage.local.get('assetsOnOtherChains', (res) => {
      const aOC = res.assetsOnOtherChains || {};

      const addressAsset = aOC[addressA] as AssetsOnOtherChains[];

      if (addressAsset) {
        const parsed = JSON.parse(addressAsset) as AssetsOnOtherChains[] | null | undefined;

        const updatedAssets = parsed?.map((asset) => {
          const totalBalanceBN = isHexToBn(asset.totalBalance as unknown as string);

          return { ...asset, totalBalance: totalBalanceBN };
        });

        updatedAssets && updatedAssets.length > 0 && setAssetsOnOtherChains(updatedAssets);
      }
    });
  }, []);

  const saveAssetsOnOtherChains = useCallback((addressA: string, fetched: AssetsOnOtherChains[]) => {
    const nonZeros = fetched.filter((asset) => !asset.totalBalance.isZero());

    chrome.storage.local.get('assetsOnOtherChains', (res) => {
      const aOC = res.assetsOnOtherChains || {};

      aOC[addressA] = JSON.stringify(nonZeros);

      // eslint-disable-next-line no-void
      void chrome.storage.local.set({ assetsOnOtherChains: aOC });
    });
  }, []);

  const fetchAssetsOnOtherChains = useCallback((accountAddress: string) => {
    type fetchedBalance = { assetId?: number, balances: string, chain: string, decimal: number, genesisHash: string, price: number, token: string };
    const worker: Worker = new Worker(new URL('../util/workers/getAssetsOnOtherChains.js', import.meta.url));
    let fetchedAssetsOnOtherChains: AssetsOnOtherChains[] = [];

    readAssetsOnOtherChains(accountAddress);

    setWorkerCalled({
      address: accountAddress,
      worker
    });
    worker.postMessage({ accountAddress });

    worker.onerror = (err) => {
      console.log(err);
    };

    worker.onmessage = (e: MessageEvent<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message = e.data;

      if (message === 'null') {
        setAssetsOnOtherChains(null);
      } else if (message === 'Done') {
        worker.terminate();

        console.log('DONE');

        setAssetsOnOtherChains(fetchedAssetsOnOtherChains);
        saveAssetsOnOtherChains(accountAddress, fetchedAssetsOnOtherChains);
      } else {
        const fetchedBalances = JSON.parse(message) as fetchedBalance[];
        const mapped = fetchedBalances.map((asset) => ({ assetId: asset?.assetId, chainName: asset.chain, decimal: Number(asset.decimal), genesisHash: asset.genesisHash, price: asset.price, token: asset.token, totalBalance: isHexToBn(asset.balances) }));

        // setAssetsOnOtherChains(mapped);
        fetchedAssetsOnOtherChains = mapped;
      }
    };
  }, [saveAssetsOnOtherChains, readAssetsOnOtherChains]);

  const terminateWorker = useCallback(() => workerCalled && workerCalled.worker.terminate(), [workerCalled]);

  useEffect(() => {
    if (!address) {
      return;
    }

    if (!workerCalled) {
      fetchAssetsOnOtherChains(String(address));
    }

    if (workerCalled && workerCalled.address !== address) {
      // setRefreshNeeded(true);
      terminateWorker();
      setAssetsOnOtherChains(undefined);
      fetchAssetsOnOtherChains(String(address));
    }
  }, [address, fetchAssetsOnOtherChains, workerCalled, terminateWorker]);

  return assets !== undefined
    ? assets
    : workerCalled?.address === address
      ? assetsOnOtherChains
      : undefined;
}
