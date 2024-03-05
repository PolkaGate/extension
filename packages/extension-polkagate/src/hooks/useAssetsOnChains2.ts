// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { createAssets } from '@polkagate/apps-config/assets';
import { Asset } from '@polkagate/apps-config/assets/types';
import { useCallback, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { getStorage, setStorage } from '../components/Loading';
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
type SavedAssets = { balances: AssetsBalancesPerAddress, timeStamp: number };

type MessageBody = {
  assetId?: number,
  totalBalance: string,
  chainName: string,
  decimal: string,
  genesisHash: string,
  priceId: string,
  token: string
};

type FetchedBalance = {
  assetId?: number,
  totalBalance: BN,
  chainName: string,
  decimal: number,
  genesisHash: string,
  priceId: string,
  token: string
};

const DEFAULT_SAVED_ASSETS = { balances: {} as AssetsBalancesPerAddress, timeStamp: Date.now() };
const assetsChains = createAssets();

/**
 * @description To fetch accounts assets on different selected chains
 * @param addresses a list of users accounts' addresses
 * @returns a list of assets balances on different selected chains and their fetching timestamps
 */
export default function useAssetsOnChains2(addresses: string[] | undefined): SavedAssets | undefined {
  const [fetchedAssets, setFetchedAssets] = useState<SavedAssets | undefined>();
  const [workerCalled, setWorkerCalled] = useState<Worker>();
  const [isOutDated, setIsOutDated] = useState<boolean>();
  const selectedChains = useSelectedChains();

  useEffect(() => {
    getStorage('assets3').then((res) => {
      setFetchedAssets(res as SavedAssets);
    }).catch(console.error);

    chrome.storage.onChanged.addListener(function (changes, areaName) {
      if (areaName === 'local' && 'assets3' in changes) {
        const newValue = changes.assets3.newValue as SavedAssets;

        setFetchedAssets(newValue);
      }
    });
  }, []);

  const combineAndSetAssets = useCallback((assets: Assets) => {
    if (!addresses) {
      console.info('no addresses to combine!');

      return;
    }

    getStorage('assets3').then((res) => {
      const savedAssets = (res || DEFAULT_SAVED_ASSETS) as SavedAssets;

      Object.keys(assets).forEach((address) => {
        if (savedAssets.balances[address] === undefined) {
          savedAssets.balances[address] = {};
        }

        const { genesisHash } = assets[address][0];

        savedAssets.balances[address][genesisHash] = assets[address];
      });

      savedAssets.timeStamp = Date.now();
      setStorage('assets3', savedAssets).catch(console.error);
    }).catch(console.error);
  }, [addresses]);

  // console.log('apps config assetsChains:', assetsChains);

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

      console.info(`getAssetOnRelayChain: assets on ${chainName}`, message);

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
