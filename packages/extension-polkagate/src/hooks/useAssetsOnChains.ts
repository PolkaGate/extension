// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useMemo, useState } from 'react';

import { SavedAccountsAssets } from '../util/types';
import { isHexToBn } from '../util/utils';

type FetchedBalance = { address: string, assetId?: number, balances: string, chain: string, decimal: number, genesisHash: string, priceId: string, token: string };

/**
 * @description To fetch accounts assets on different selected chains
 * @param addresses a list of users accounts' addresses
 * @returns a list of assets balances on different selected chains and their fetching timestamps
 */
export default function useAssetsOnChains(addresses: string[] | undefined): SavedAccountsAssets | undefined {
  const [accountsAssets, setAccountsAssets] = useState<SavedAccountsAssets | undefined>();
  const [workerCalled, setWorkerCalled] = useState<Worker>();
  const [isOutDated, setIsOutDated] = useState<boolean>();

  const readAccountAssets = useCallback(() => {
    chrome.storage.local.get('accountsAssets', (res) => {
      try {
        const aOC = res.accountsAssets || {};

        // NEEDS DOUBLE CHECK, ON BIG NUMBERS!
        if (aOC) {
          const parsed = JSON.parse(aOC) as SavedAccountsAssets | null | undefined;

          const timeOut = (Date.now() - (parsed?.timestamp ?? 0) > (1000 * 60));

          setIsOutDated(timeOut);

          parsed?.balances.forEach((account) => {
            account.assets.map((asset) => {
              const totalBalanceBN = isHexToBn(asset.totalBalance as unknown as string);

              asset.totalBalance = totalBalanceBN;

              return asset;
            });
          });

          parsed && setAccountsAssets(parsed);
        }
      } catch (error) {
        setIsOutDated(true);
      }
    });
  }, []);

  const newAccountAdded = useMemo((): boolean => {
    if (!addresses || addresses.length === 0 || !accountsAssets) {
      return false;
    }

    const noNewAccountAdded = addresses.every((address) => !!accountsAssets.balances.find((accountAsset) => accountAsset.address === address));

    return !noNewAccountAdded;
  }, [accountsAssets, addresses]);

  const fetchAssetsOnOtherChains = useCallback((_addresses: string[]) => {
    const worker: Worker = new Worker(new URL('../util/workers/getAssetsOnOtherChains.js', import.meta.url));
    let fetchedAssetsOnOtherChains: FetchedBalance[] = [];

    setWorkerCalled(worker);
    worker.postMessage({ accounts: _addresses });

    worker.onerror = (err) => {
      console.log(err);
    };

    worker.onmessage = (e: MessageEvent<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message = e.data;

      if (message === 'null') {
        setAccountsAssets(undefined);
      } else if (message === 'Done') {
        worker.terminate();

        const mapped = fetchedAssetsOnOtherChains.map((asset) => ({ address: asset.address, assetId: asset?.assetId, chainName: asset.chain, decimal: Number(asset.decimal), genesisHash: asset.genesisHash, priceId: asset.priceId, token: asset.token, totalBalance: isHexToBn(asset.balances) }));
        const combine = _addresses.map((address) => {
          const accountBalance = mapped.filter((balance) => balance.address === address);
          const assets = accountBalance.map((b) => ({
            assetId: b.assetId,
            chainName: b.chainName,
            decimal: b.decimal,
            genesisHash: b.genesisHash,
            priceId: b.priceId,
            token: b.token,
            totalBalance: b.totalBalance
          }));

          return {
            address,
            assets
          };
        });

        setAccountsAssets({ balances: combine, timestamp: Date.now() });
      } else {
        const fetchedBalances = JSON.parse(message) as FetchedBalance[];

        fetchedAssetsOnOtherChains = fetchedBalances;
      }
    };
  }, []);

  useEffect(() => {
    if (!addresses || addresses.length === 0 || workerCalled) {
      return;
    }

    (isOutDated || newAccountAdded) && fetchAssetsOnOtherChains(addresses);
  }, [addresses, fetchAssetsOnOtherChains, isOutDated, newAccountAdded, workerCalled]);

  useEffect(() => {
    if (!addresses || addresses.length === 0 || workerCalled || accountsAssets) {
      return;
    }

    readAccountAssets();
  }, [accountsAssets, addresses, readAccountAssets, workerCalled]);

  return accountsAssets;
}
