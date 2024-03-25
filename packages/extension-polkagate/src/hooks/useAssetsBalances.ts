// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { createAssets } from '@polkagate/apps-config/assets';
import { Asset } from '@polkagate/apps-config/assets/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AccountJson } from '@polkadot/extension-base/background/types';
import { BN } from '@polkadot/util';

import { getStorage, setStorage, watchStorage } from '../components/Loading';
import { toCamelCase } from '../fullscreen/governance/utils/util';
import allChains from '../util/chains';
import { ASSET_HUBS, RELAY_CHAINS_GENESISHASH, TEST_NETS } from '../util/constants';
import getChainName from '../util/getChainName';
import { isHexToBn, sanitizeChainName } from '../util/utils';
import useSelectedChains from './useSelectedChains';
import { useIsTestnetEnabled } from '.';

type WorkerMessage = Record<string, MessageBody[]>;
type Assets = Record<string, FetchedBalance[]>;
type AssetsBalancesPerChain = { [genesisHash: string]: FetchedBalance[] };
type AssetsBalancesPerAddress = { [address: string]: AssetsBalancesPerChain };
export interface SavedAssets { balances: AssetsBalancesPerAddress, timeStamp: number }

interface BalancesDetails {
  availableBalance: BN,
  soloTotal: BN,
  pooledBalance: BN,
  lockedBalance: BN,
  vestingLocked: BN,
  vestedClaimable: BN,
  vestingTotal: BN,
  freeBalance: BN,
  frozenFee: BN,
  frozenMisc: BN,
  reservedBalance: BN,
  votingBalance: BN
}

type MessageBody = {
  assetId?: number,
  totalBalance: string,
  chainName: string,
  decimal: string,
  genesisHash: string,
  priceId: string,
  token: string,
  balanceDetails: string,
};

export const BN_MEMBERS = [
  'totalBalance',
  'availableBalance',
  'soloTotal',
  'pooledBalance',
  'lockedBalance',
  'vestingLocked',
  'vestedClaimable',
  'vestingTotal',
  'freeBalance',
  'frozenFee',
  'frozenMisc',
  'reservedBalance',
  'votingBalance'
];

export interface FetchedBalance {
  assetId?: number,
  totalBalance: BN,
  chainName: string,
  decimal: number,
  genesisHash: string,
  priceId: string,
  token: string,
  availableBalance: BN,
  soloTotal: BN,
  pooledBalance: BN,
  lockedBalance: BN,
  vestingLocked: BN,
  vestedClaimable: BN,
  vestingTotal: BN,
  freeBalance: BN,
  frozenFee: BN,
  frozenMisc: BN,
  reservedBalance: BN,
  votingBalance: BN
}

const DEFAULT_SAVED_ASSETS = { balances: {} as AssetsBalancesPerAddress, timeStamp: Date.now() };

export const ASSETS_NAME_IN_STORAGE = 'assets';
const BALANCE_VALIDITY_PERIOD = 2 * 1000 * 60;

const isUpToDate = (date?: number): boolean | undefined => date ? Date.now() - date < BALANCE_VALIDITY_PERIOD : undefined;

function allHexToBN (balances: string): BalancesDetails {
  const parsedBalances = JSON.parse(balances) as BalancesDetails;
  const _balances = {} as BalancesDetails;

  Object.keys(parsedBalances).forEach((item) => {
    _balances[item] = isHexToBn(parsedBalances[item] as string);
  });

  return _balances;
}

const assetsChains = createAssets();

/**
 * @description To fetch accounts assets on different selected chains
 * @param addresses a list of users accounts' addresses
 * @returns a list of assets balances on different selected chains and a fetching timestamp
 */
export default function useAssetsBalances (accounts: AccountJson[] | null): SavedAssets | undefined | null {
  const isTestnetEnabled = useIsTestnetEnabled();

  /** We need to trigger address change when a new address is added, without affecting other account fields. Therefore, we use the length of the accounts array as a dependency. */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const addresses = useMemo(() => accounts?.map(({ address }) => address), [accounts?.length]);

  const [fetchedAssets, setFetchedAssets] = useState<SavedAssets | undefined | null>();
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [workersCalled, setWorkersCalled] = useState<Worker[]>();
  const [isUpdate, setIsUpdate] = useState<boolean>();
  const selectedChains = useSelectedChains();

  useEffect(() => {
    getStorage(ASSETS_NAME_IN_STORAGE, true).then((savedAssets) => {
      const _timeStamp = (savedAssets as SavedAssets)?.timeStamp;

      setIsUpdate(isUpToDate(_timeStamp));
    }).catch(console.error);
  }, [workersCalled?.length]);

  const handleAccountsSaving = useCallback(() => {
    const toBeSavedAssets = fetchedAssets || DEFAULT_SAVED_ASSETS;
    const addressesInToBeSavedAssets = Object.keys((toBeSavedAssets as SavedAssets)?.balances || []);
    const addressesWithoutBalance = addresses!.filter((address) => !addressesInToBeSavedAssets.includes(address));

    addressesWithoutBalance.forEach((address) => {
      toBeSavedAssets.balances[address] = {};
    });

    setFetchedAssets(toBeSavedAssets);
    setStorage(ASSETS_NAME_IN_STORAGE, toBeSavedAssets, true).catch(console.error);
    setWorkersCalled(undefined);
  }, [addresses, fetchedAssets]);

  useEffect(() => {
    /** when one round fetch is done, we will save fetched assets in storage */
    if (addresses && workersCalled?.length === 0) {
      setWorkersCalled(undefined);
      handleAccountsSaving();
    }
  }, [accounts, addresses, handleAccountsSaving, workersCalled?.length]);

  useEffect(() => {
    /** chain list may have changed */
    isUpdate && !isWorking && selectedChains?.length && setIsUpdate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChains]);

  useEffect(() => {
    /** account list may have changed */
    isUpdate && !isWorking && addresses?.length && setIsUpdate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  useEffect(() => {
    setIsWorking(!!workersCalled?.length);
  }, [workersCalled?.length]);

  useEffect(() => {
    if (!addresses) {
      console.info('useAssetsBalances: no addresses to fetch assets!');

      return setFetchedAssets(null);
    }

    getStorage(ASSETS_NAME_IN_STORAGE, true).then((savedAssets) => {
      if (!savedAssets || Object.keys(savedAssets).length === 0) {
        return;
      }

      setFetchedAssets(savedAssets as SavedAssets);
    }).catch(console.error);

    watchStorage(ASSETS_NAME_IN_STORAGE, setFetchedAssets, true).catch(console.error);
  }, [addresses]);

  const handleSetWorkersCall = useCallback((worker: Worker, terminate?: 'terminate') => {
    terminate && worker.terminate();

    setWorkersCalled((workersCalled) => {
      terminate
        ? workersCalled?.pop()
        : !workersCalled
          ? workersCalled = [worker]
          : workersCalled.push(worker);

      return workersCalled && [...workersCalled] as Worker[];
    });
  }, []);

  const combineAndSetAssets = useCallback((assets: Assets) => {
    if (!addresses) {
      console.info('no addresses to combine!');

      return;
    }

    setFetchedAssets((fetchedAssets) => {
      const combinedAsset = fetchedAssets || DEFAULT_SAVED_ASSETS;

      Object.keys(assets).forEach((address) => {
        if (combinedAsset.balances[address] === undefined) {
          combinedAsset.balances[address] = {};
        }

        /** to group assets by their chain's genesisHash */
        const { genesisHash } = assets[address][0];

        combinedAsset.balances[address][genesisHash] = assets[address];
      });

      combinedAsset.timeStamp = Date.now();

      return combinedAsset;
    });
  }, [addresses]);

  const fetchAssetOnRelayChain = useCallback((_addresses: string[], chainName: string) => {
    const worker: Worker = new Worker(new URL('../util/workers/getAssetOnRelayChain.js', import.meta.url));
    const _assets: Assets = {};

    handleSetWorkersCall(worker);

    worker.postMessage({ addresses: _addresses, chainName });

    worker.onerror = (err) => {
      console.log(err);
    };

    worker.onmessage = (e: MessageEvent<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message = e.data;

      if (!message) {
        console.info(`No assets found on ${chainName}`);
        handleSetWorkersCall(worker, 'terminate');

        return;
      }

      const parsedMessage = JSON.parse(message) as WorkerMessage;

      Object.keys(parsedMessage).forEach((address) => {
        /** We use index 0 because each relay chain has only one asset */
        _assets[address] = [
          {
            ...parsedMessage[address][0],
            ...allHexToBN(parsedMessage[address][0].balanceDetails),
            decimal: Number(parsedMessage[address][0].decimal),
            totalBalance: isHexToBn(parsedMessage[address][0].totalBalance)
          }];

        delete _assets[address][0].balanceDetails;
      });

      combineAndSetAssets(_assets);
      handleSetWorkersCall(worker, 'terminate');
    };
  }, [combineAndSetAssets, handleSetWorkersCall]);

  const fetchAssetOnAssetHubs = useCallback((_addresses: string[], chainName: string, assetsToBeFetched?: Asset[]) => {
    const worker: Worker = new Worker(new URL('../util/workers/getAssetOnAssetHub.js', import.meta.url));
    const _assets: Assets = {};

    handleSetWorkersCall(worker);
    worker.postMessage({ addresses: _addresses, assetsToBeFetched, chainName });

    worker.onerror = (err) => {
      console.log(err);
    };

    worker.onmessage = (e: MessageEvent<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message = e.data;

      if (!message) {
        console.info(`fetchAssetOnAssetHubs: No assets found on ${chainName}`);
        handleSetWorkersCall(worker, 'terminate');

        return;
      }

      const parsedMessage = JSON.parse(message) as WorkerMessage;

      Object.keys(parsedMessage).forEach((address) => {
        _assets[address] = parsedMessage[address].map((message) => ({ ...message, decimal: Number(message.decimal), totalBalance: isHexToBn(message.totalBalance) }));
      });

      combineAndSetAssets(_assets);
      handleSetWorkersCall(worker, 'terminate');
    };
  }, [combineAndSetAssets, handleSetWorkersCall]);

  const fetchAssetsOnAcala = useCallback((_addresses: string[]) => {
    const worker: Worker = new Worker(new URL('../util/workers/getAssetOnAcala.js', import.meta.url));

    handleSetWorkersCall(worker);
    worker.postMessage({ addresses: _addresses });

    worker.onerror = (err) => {
      console.log(err);
    };

    worker.onmessage = (e: MessageEvent<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message = e.data;

      if (!message) {
        console.info('fetchAssetsOnAcala: No assets found on Acala');
        handleSetWorkersCall(worker, 'terminate');

        return;
      }

      const parsedMessage = JSON.parse(message) as WorkerMessage;
      const _assets: Assets = {};

      Object.keys(parsedMessage).forEach((address) => {
        _assets[address] = parsedMessage[address].map(
          (message) => {
            const temp = { ...message,
              ...allHexToBN(message.balanceDetails),
              decimal: Number(message.decimal),
              totalBalance: isHexToBn(message.totalBalance) };

            delete temp.balanceDetails;

            return temp;
          });
      });

      combineAndSetAssets(_assets);
      handleSetWorkersCall(worker, 'terminate');
    };
  }, [combineAndSetAssets, handleSetWorkersCall]);

  const fetchAssetsOnHydraDx = useCallback((_addresses: string[]) => {
    const worker: Worker = new Worker(new URL('../util/workers/getAssetOnHydraDx.js', import.meta.url));

    handleSetWorkersCall(worker);
    worker.postMessage({ addresses: _addresses });

    worker.onerror = (err) => {
      console.log(err);
    };

    worker.onmessage = (e: MessageEvent<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message = e.data;

      if (!message) {
        console.info('fetchAssetsOnHydraDx: No assets found on HydraDx');
        handleSetWorkersCall(worker, 'terminate');

        return;
      }

      const parsedMessage = JSON.parse(message) as WorkerMessage;
      const _assets: Assets = {};

      Object.keys(parsedMessage).forEach((address) => {
        _assets[address] = parsedMessage[address].map(
          (message) => {
            const temp = { ...message,
              ...allHexToBN(message.balanceDetails),
              decimal: Number(message.decimal),
              totalBalance: isHexToBn(message.totalBalance) };

            delete temp.balanceDetails;

            return temp;
          });
      });

      combineAndSetAssets(_assets);
      handleSetWorkersCall(worker, 'terminate');
    };
  }, [combineAndSetAssets, handleSetWorkersCall]);

  const fetchMultiAssetChainAssets = useCallback((maybeMultiAssetChainName: string) => {
    if (maybeMultiAssetChainName === 'acala') {
      return fetchAssetsOnAcala(addresses!);
    }

    if (maybeMultiAssetChainName === 'hydradx') {
      return fetchAssetsOnHydraDx(addresses!);
    }
  }, [addresses, fetchAssetsOnAcala, fetchAssetsOnHydraDx]);

  const fetchAssets = useCallback((genesisHash: string, isSingleTokenChain: boolean, maybeMultiAssetChainName: string | undefined) => {
    /** Checking assets balances on Relay chains */
    /** and also checking assets on chains with just one native token */
    if (RELAY_CHAINS_GENESISHASH.includes(genesisHash) || isSingleTokenChain) {
      const chainName = getChainName(genesisHash);

      if (!chainName) {
        console.error('can not find chain name by genesis hash!');

        return;
      }

      return chainName && fetchAssetOnRelayChain(addresses!, chainName);
    }

    if (ASSET_HUBS.includes(genesisHash)) { /** Checking assets balances on Asset Hub chains */
      const chainName = getChainName(genesisHash);

      if (!chainName) {
        console.error('can not find chain name by genesis hash!');

        return;
      }

      const assetsToBeFetched = assetsChains[chainName]; /** we fetch asset hubs assets only if it is whitelisted via Polkagate/apps-config */

      return fetchAssetOnAssetHubs(addresses!, chainName, assetsToBeFetched);
    }

    /** Checking assets balances on chains with more than one assets such as Acala, hydradx, etc, */
    if (maybeMultiAssetChainName) {
      fetchMultiAssetChainAssets(maybeMultiAssetChainName);
    }
  }, [addresses, fetchAssetOnAssetHubs, fetchAssetOnRelayChain, fetchMultiAssetChainAssets]);

  useEffect(() => {
    if (!addresses || addresses.length === 0 || isWorking || isUpdate || !selectedChains || isTestnetEnabled === undefined) {
      return;
    }

    const _selectedChains = isTestnetEnabled ? selectedChains : selectedChains.filter((genesisHash) => !TEST_NETS.includes(genesisHash));
    const multipleAssetsChainsNames = Object.keys(assetsChains).map((chainName) => chainName.toLowerCase());

    const singleAssetChains = allChains.filter(({ chain, genesisHash }) =>
      _selectedChains.includes(genesisHash) &&
      !ASSET_HUBS.includes(genesisHash) &&
      !RELAY_CHAINS_GENESISHASH.includes(genesisHash) &&
      !multipleAssetsChainsNames.includes(sanitizeChainName(chain)?.toLowerCase() || '')
    );

    /** Fetch assets for all the selected chains by default */
    _selectedChains?.forEach((genesisHash) => {
      const isSingleTokenChain = !!singleAssetChains.find((o) => o.genesisHash === genesisHash);
      const maybeMultiAssetChainName = multipleAssetsChainsNames.find((chainName) => chainName === getChainName(genesisHash)?.toLowerCase());

      fetchAssets(genesisHash, isSingleTokenChain, maybeMultiAssetChainName);
    });
  }, [addresses, fetchAssets, isTestnetEnabled, isUpdate, isWorking, selectedChains]);

  return fetchedAssets;
}
