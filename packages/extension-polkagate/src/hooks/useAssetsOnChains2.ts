// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { createAssets } from '@polkagate/apps-config/assets';
import { Asset } from '@polkagate/apps-config/assets/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AccountJson } from '@polkadot/extension-base/background/types';
import { BN } from '@polkadot/util';

import { getStorage, setStorage, watchStorage } from '../components/Loading';
import { toCamelCase } from '../popup/governance/utils/util';
import allChains from '../util/chains';
import { ASSET_HUBS, RELAY_CHAINS_GENESISHASH } from '../util/constants';
import getChainName from '../util/getChainName';
import { isHexToBn } from '../util/utils';
import useSelectedChains from './useSelectedChains';

type WorkerMessage = Record<string, MessageBody[]>;
type Assets = Record<string, FetchedBalance[]>;
type AssetsBalancesPerChain = { [genesisHash: string]: FetchedBalance[] };
type AssetsBalancesPerAddress = { [address: string]: AssetsBalancesPerChain };
export interface SavedAssets { balances: AssetsBalancesPerAddress, timeStamp: number }

type MessageBody = {
  assetId?: number,
  totalBalance: string,
  chainName: string,
  decimal: string,
  genesisHash: string,
  priceId: string,
  token: string
};

export interface FetchedBalance {
  assetId?: number,
  totalBalance: BN,
  chainName: string,
  decimal: number,
  genesisHash: string,
  priceId: string,
  token: string
}

const DEFAULT_SAVED_ASSETS = { balances: {} as AssetsBalancesPerAddress, timeStamp: Date.now() };
const assetsChains = createAssets();

/**
 * @description To fetch accounts assets on different selected chains
 * @param addresses a list of users accounts' addresses
 * @returns a list of assets balances on different selected chains and their fetching timestamps
 */
export default function useAssetsOnChains2 (accounts: AccountJson[] | null): SavedAssets | undefined | null {
  const addresses = useMemo(() => accounts?.map(({ address }) => address), [accounts]);

  const [fetchedAssets, setFetchedAssets] = useState<SavedAssets | undefined | null>();
  const [workerCalled, setWorkerCalled] = useState<Worker>();
  const [isOutDated, setIsOutDated] = useState<boolean>();
  const selectedChains = useSelectedChains();

  useEffect(() => {
    if (!addresses) {
      console.info('useAssetsOnChains2: no addresses to fetch assets!');

      return setFetchedAssets(null);
    }

    getStorage('assets6').then((savedAssets) => {
      /** handle BN issues */
      if (!savedAssets) {
        return;
      }

      const parsedAssets = JSON.parse(savedAssets as string) as SavedAssets;

      // Object.keys(parsedAssets).forEach((address) => {
      //   parsedAssets.balances?.[address] && Object.keys(parsedAssets.balances[address]).forEach((genesisHash) => {
      //     parsedAssets.balances[address]?.[genesisHash]?.map((asset) => {
      //       asset.totalBalance = isHexToBn(asset.totalBalance as unknown as string);

      //       return asset;
      //     });
      //   });
      // });

      setFetchedAssets(parsedAssets);
    }).catch(console.error);

    watchStorage('assets6', setFetchedAssets, true).catch(console.error);
  }, [addresses]);

  const combineAndSetAssets = useCallback((assets: Assets) => {
    if (!addresses) {
      console.info('no addresses to combine!');

      return;
    }

    getStorage('assets6').then((res) => {
      const savedAssets = (res || JSON.stringify(DEFAULT_SAVED_ASSETS)) as string;
      const parsedAssets = JSON.parse(savedAssets) as SavedAssets;

      Object.keys(assets).forEach((address) => {
        if (parsedAssets.balances[address] === undefined) {
          parsedAssets.balances[address] = {};
        }

        const { genesisHash } = assets[address][0];

        parsedAssets.balances[address][genesisHash] = assets[address];
      });

      parsedAssets.timeStamp = Date.now();
      /** we use JSON.stringify to cope with saving BN issue */
      setStorage('assets6', JSON.stringify(parsedAssets)).catch(console.error);
    }).catch(console.error);
  }, [addresses]);

  const fetchAssetOnRelayChain = useCallback((_addresses: string[], chainName: string) => {
    const worker: Worker = new Worker(new URL('../util/workers/getAssetOnRelayChain.js', import.meta.url));
    const _assets: Assets = {};

    setWorkerCalled(worker);
    worker.postMessage({ addresses: _addresses, chainName });

    worker.onerror = (err) => {
      console.log(err);
    };

    worker.onmessage = (e: MessageEvent<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message = e.data;

      worker.terminate();

      if (!message) {
        console.info(`getAssetOnRelayChain: No assets found on ${chainName}`);

        return;
      }

      const parsedMessage = JSON.parse(message) as WorkerMessage;

      Object.keys(parsedMessage).forEach((address) => {
        /** We use index 0 because each relay chain has only one asset */
        _assets[address] = [{ ...parsedMessage[address][0], decimal: Number(parsedMessage[address][0].decimal), totalBalance: isHexToBn(parsedMessage[address][0].totalBalance) }];
      });

      combineAndSetAssets(_assets);
    };
  }, [combineAndSetAssets]);

  const fetchAssetOnAssetHubs = useCallback((_addresses: string[], chainName: string, assetsToBeFetched?: Asset[]) => {
    const worker: Worker = new Worker(new URL('../util/workers/getAssetOnAssetHub.js', import.meta.url));
    const _assets: Assets = {};

    setWorkerCalled(worker);
    worker.postMessage({ addresses: _addresses, assetsToBeFetched, chainName });

    worker.onerror = (err) => {
      console.log(err);
    };

    worker.onmessage = (e: MessageEvent<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message = e.data;

      worker.terminate();

      if (!message) {
        console.info(`fetchAssetOnAssetHubs: No assets found on ${chainName}`);

        return;
      }

      console.info(`fetchAssetOnAssetHubs: assets on ${chainName}`, message);

      const parsedMessage = JSON.parse(message) as WorkerMessage;

      Object.keys(parsedMessage).forEach((address) => {
        _assets[address] = parsedMessage[address].map((message) => ({ ...message, decimal: Number(message.decimal), totalBalance: isHexToBn(message.totalBalance) }));
      });

      combineAndSetAssets(_assets);
    };
  }, [combineAndSetAssets]);

  const fetchAssetsOnAcala = useCallback((_addresses: string[]) => {
    const worker: Worker = new Worker(new URL('../util/workers/getAssetOnAcala.js', import.meta.url));
    const _assets: Assets = {};

    setWorkerCalled(worker);
    worker.postMessage({ addresses: _addresses });

    worker.onerror = (err) => {
      console.log(err);
    };

    worker.onmessage = (e: MessageEvent<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message = e.data;

      worker.terminate();

      if (!message) {
        console.info('fetchAssetsOnAcala: No assets found on Acala');

        return;
      }

      console.info('fetchAssetsOnAcala: assets message on Acala', message);

      const parsedMessage = JSON.parse(message) as WorkerMessage;

      Object.keys(parsedMessage).forEach((address) => {
        _assets[address] = parsedMessage[address].map((message) => ({ ...message, decimal: Number(message.decimal), totalBalance: isHexToBn(message.totalBalance) }));
      });

      combineAndSetAssets(_assets);
    };
  }, [combineAndSetAssets]);

  const fetchMultiAssetChainAssets = useCallback((maybeMultiAssetChainName: string) => {
    // if (maybeMultiAssetChainName === 'acala') {
    //   fetchAssetsOnAcala(addresses!);
    // }
  }, []);

  const fetchAssets = useCallback((genesisHash: string, isSingleTokenChain: boolean, maybeMultiAssetChainName: string | undefined) => {
    /** Checking assets balances on Relay chains */
    /** and also checking assets on chains with just one native token */
    if (RELAY_CHAINS_GENESISHASH.includes(genesisHash) || isSingleTokenChain) {
      const chainName = getChainName(genesisHash);

      if (!chainName) {
        console.error('can not find chain name by genesis hash!');

        return;
      }

      console.log('useAssetsOnChains2: to fetch assets for relayChains:', chainName);

      return chainName && fetchAssetOnRelayChain(addresses!, chainName);
    }

    if (ASSET_HUBS.includes(genesisHash)) { /** Checking assets balances on Asset Hub chains */
      const chainName = getChainName(genesisHash);

      if (!chainName) {
        console.error('can not find chain name by genesis hash!');

        return;
      }

      const assetsToBeFetched = assetsChains[chainName]; /** we fetch asset hubs assets only if it is whitelisted via Polkagate/apps-config */

      console.log('useAssetsOnChains2: to fetch assets for assetHubs:', chainName, assetsToBeFetched);

      return fetchAssetOnAssetHubs(addresses!, chainName, assetsToBeFetched);
    }

    /** Checking assets balances on chains with more than one assets such as Acala, hydradx, etc, */
    maybeMultiAssetChainName && fetchMultiAssetChainAssets(maybeMultiAssetChainName);
  }, [addresses, fetchAssetOnAssetHubs, fetchAssetOnRelayChain, fetchMultiAssetChainAssets]);

  useEffect(() => {
    if (!addresses || addresses.length === 0 || workerCalled || !selectedChains) {
      return;
    }

    const multipleAssetsChainsNames = Object.keys(assetsChains);

    const otherSingleAssetChains = allChains.filter(({ chain, genesisHash }) =>
      selectedChains.includes(genesisHash) &&
      !ASSET_HUBS.includes(genesisHash) &&
      !RELAY_CHAINS_GENESISHASH.includes(genesisHash) &&
      !multipleAssetsChainsNames.includes(toCamelCase(chain))
    );

    /** Fetch assets for all the selected chains by default */
    selectedChains?.forEach((genesisHash) => {
      const isSingleTokenChain = !!otherSingleAssetChains.find((o) => o.genesisHash === genesisHash);
      const maybeMultiAssetChainName = multipleAssetsChainsNames.find((chainName) => chainName === getChainName(genesisHash));

      fetchAssets(genesisHash, isSingleTokenChain, maybeMultiAssetChainName);
    });
  }, [addresses, fetchAssets, selectedChains, workerCalled]);

  return fetchedAssets;
}
