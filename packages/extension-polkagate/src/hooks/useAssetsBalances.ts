// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Asset } from '@polkagate/apps-config/assets/types';
import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { MetadataDef } from '@polkadot/extension-inject/types';
import type { AlertType, DropdownOption, UserAddedChains } from '../util/types';

import { createAssets } from '@polkagate/apps-config/assets';
import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';

import { BN, isObject } from '@polkadot/util';

import { getStorage, setStorage, watchStorage } from '../components/Loading';
import { toCamelCase } from '../fullscreen/governance/utils/util';
import { updateMetadata } from '../messaging';
import { ASSET_HUBS, RELAY_CHAINS_GENESISHASH, TEST_NETS } from '../util/constants';
import getChainName from '../util/getChainName';
import { isHexToBn } from '../util/utils';
import useSelectedChains from './useSelectedChains';
import { useIsTestnetEnabled, useTranslation } from '.';

type WorkerMessage = Record<string, MessageBody[]>;
type Assets = Record<string, FetchedBalance[]>;
type AssetsBalancesPerChain = Record<string, FetchedBalance[]>;
type AssetsBalancesPerAddress = Record<string, AssetsBalancesPerChain>;
export interface SavedAssets { balances: AssetsBalancesPerAddress, timeStamp: number }

interface BalancesDetails {
  availableBalance: BN,
  soloTotal?: BN,
  pooledBalance?: BN,
  lockedBalance?: BN,
  vestingLocked?: BN,
  vestedClaimable?: BN,
  vestingTotal?: BN,
  freeBalance: BN,
  frozenFee?: BN,
  frozenMisc?: BN,
  reservedBalance: BN,
  votingBalance?: BN
}

interface MessageBody {
  assetId?: number,
  totalBalance: string,
  chainName: string,
  decimal: string,
  genesisHash: string,
  priceId: string,
  token: string,
  balanceDetails?: string,
}

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
  'frozenBalance',
  'frozenFee',
  'frozenMisc',
  'reservedBalance',
  'votingBalance'
];

export interface FetchedBalance {
  assetId?: number,
  availableBalance: BN,
  balanceDetails?: any,
  totalBalance: BN,
  chainName: string,
  date?: number,
  decimal: number,
  genesisHash: string,
  priceId: string,
  price?: number,
  token: string,
  soloTotal?: BN,
  pooledBalance?: BN,
  lockedBalance?: BN,
  vestingLocked?: BN,
  vestedClaimable?: BN,
  vestingTotal?: BN,
  freeBalance?: BN,
  frozenFee?: BN,
  frozenMisc?: BN,
  reservedBalance?: BN,
  votingBalance?: BN
}

const DEFAULT_SAVED_ASSETS = { balances: {} as AssetsBalancesPerAddress, timeStamp: Date.now() };

export const ASSETS_NAME_IN_STORAGE = 'assets';
const BALANCE_VALIDITY_PERIOD = 1 * 1000 * 60;

const isUpToDate = (date?: number): boolean | undefined => date ? Date.now() - date < BALANCE_VALIDITY_PERIOD : undefined;

function allHexToBN (balances: object | string | undefined): BalancesDetails | {} {
  if (!balances) {
    return {};
  }

  const parsedBalances = isObject(balances) ? balances : JSON.parse(balances as string) as BalancesDetails;
  const _balances = {} as BalancesDetails;

  Object.keys(parsedBalances).forEach((item) => {
    const key = item as keyof BalancesDetails;

    if (parsedBalances[key] !== 'undefined') {
      _balances[key] = isHexToBn(parsedBalances[key] as unknown as string);
    }
  });

  return _balances;
}

const assetsChains = createAssets();

/**
 * @description To fetch accounts assets on different selected chains
 * @param addresses a list of users accounts' addresses
 * @returns a list of assets balances on different selected chains and a fetching timestamp
 */
export default function useAssetsBalances (accounts: AccountJson[] | null, setAlerts: Dispatch<SetStateAction<AlertType[]>>, genesisOptions: DropdownOption[], userAddedEndpoints: UserAddedChains): SavedAssets | undefined | null {
  const { t } = useTranslation();

  const isTestnetEnabled = useIsTestnetEnabled();
  const selectedChains = useSelectedChains();

  /** to limit calling of this heavy call on just home and account details */
  const SHOULD_FETCH_ASSETS = window.location.hash === '#/' || window.location.hash.startsWith('#/accountfs');

  /** We need to trigger address change when a new address is added, without affecting other account fields. Therefore, we use the length of the accounts array as a dependency. */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const addresses = useMemo(() => accounts?.map(({ address }) => address), [accounts?.length]);

  const [fetchedAssets, setFetchedAssets] = useState<SavedAssets | undefined | null>();
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [workersCalled, setWorkersCalled] = useState<Worker[]>();
  const [isUpdate, setIsUpdate] = useState<boolean>(false);

  useEffect(() => {
    SHOULD_FETCH_ASSETS && getStorage(ASSETS_NAME_IN_STORAGE, true).then((savedAssets) => {
      const _timeStamp = (savedAssets as SavedAssets)?.timeStamp;

      setIsUpdate(Boolean(isUpToDate(_timeStamp)));
    }).catch(console.error);
  }, [SHOULD_FETCH_ASSETS]);

  const removeZeroBalanceRecords = useCallback((toBeSavedAssets: SavedAssets): SavedAssets => {
    const _toBeSavedAssets = { ...toBeSavedAssets };
    const balances = (_toBeSavedAssets)?.balances || [];

    Object.entries(balances).forEach(([address, assetsPerChain]) => {
      Object.entries(assetsPerChain).forEach(([genesisHash, fetchedBalance]) => {
        const toBeDeletedIndexes: string[] = [];

        fetchedBalance.forEach(({ token, totalBalance }, _index) => {
          if (new BN(totalBalance).isZero()) {
            toBeDeletedIndexes.push(token);
          }
        });

        toBeDeletedIndexes.forEach((_token) => {
          const index = _toBeSavedAssets.balances[address][genesisHash].findIndex(({ token }) => _token === token);

          index >= 0 && _toBeSavedAssets.balances[address][genesisHash].splice(index, 1);
        });

        // if fetched balances array on the chain is empty then remove that genesis hash from the structure
        if (!fetchedBalance.length) {
          delete _toBeSavedAssets.balances[address][genesisHash];
        }
      });
    });

    return _toBeSavedAssets;
  }, []);

  const handleAccountsSaving = useCallback(() => {
    const toBeSavedAssets = fetchedAssets || DEFAULT_SAVED_ASSETS;
    const addressesInToBeSavedAssets = Object.keys((toBeSavedAssets as SavedAssets)?.balances || []);
    const addressesWithoutBalance = addresses!.filter((address) => !addressesInToBeSavedAssets.includes(address));

    addressesWithoutBalance.forEach((address) => {
      toBeSavedAssets.balances[address] = {};
    });

    // Remove assets whose balances drop to zero and have not been retrieved to be combined
    const updatedAssetsToBeSaved = removeZeroBalanceRecords(toBeSavedAssets);

    setFetchedAssets(updatedAssetsToBeSaved);
    setStorage(ASSETS_NAME_IN_STORAGE, updatedAssetsToBeSaved, true).catch(console.error);
    setWorkersCalled(undefined);
    setIsUpdate(true);
  }, [addresses, fetchedAssets, removeZeroBalanceRecords]);

  useEffect(() => {
    /** when one round fetch is done, we will save fetched assets in storage */
    if (addresses && workersCalled?.length === 0) {
      handleAccountsSaving();
      setAlerts((perv) => [...perv, { severity: 'success', text: t('Accounts\' balances updated!') }]);
    }
  }, [addresses, handleAccountsSaving, setAlerts, t, workersCalled?.length]);

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
    if (!SHOULD_FETCH_ASSETS) {
      return;
    }

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
  }, [SHOULD_FETCH_ASSETS, addresses]);

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

    worker.postMessage({ addresses: _addresses, chainName, userAddedEndpoints });

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

      if ('metadata' in parsedMessage) {
        const metadata = parsedMessage['metadata'];

        updateMetadata(metadata as unknown as MetadataDef).catch(console.error);

        return;
      }

      Object.keys(parsedMessage).forEach((address) => {
        /** We use index 0 because we consider each relay chain has only one asset */
        _assets[address] = [
          {
            price: undefined,
            ...parsedMessage[address][0],
            ...allHexToBN(parsedMessage[address][0].balanceDetails) as BalancesDetails,
            date: Date.now(),
            decimal: Number(parsedMessage[address][0].decimal),
            totalBalance: isHexToBn(parsedMessage[address][0].totalBalance)
          }];

        /** since balanceDetails is already converted all to BN, hence we can delete that field */
        delete _assets[address][0].balanceDetails;
      });

      combineAndSetAssets(_assets);
      handleSetWorkersCall(worker, 'terminate');
    };
  }, [combineAndSetAssets, handleSetWorkersCall, userAddedEndpoints]);

  const fetchAssetOnAssetHubs = useCallback((_addresses: string[], chainName: string, assetsToBeFetched?: Asset[]) => {
    const worker: Worker = new Worker(new URL('../util/workers/getAssetOnAssetHub.js', import.meta.url));
    const _assets: Assets = {};

    handleSetWorkersCall(worker);
    worker.postMessage({ addresses: _addresses, assetsToBeFetched, chainName, userAddedEndpoints });

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

      if ('metadata' in parsedMessage) {
        const metadata = parsedMessage['metadata'];

        updateMetadata(metadata as unknown as MetadataDef).catch(console.error);

        return;
      }

      Object.keys(parsedMessage).forEach((address) => {
        _assets[address] = parsedMessage[address]
          .map((message) => {
            const _asset = {
              ...message,
              ...allHexToBN(message.balanceDetails) as BalancesDetails,
              date: Date.now(),
              decimal: Number(message.decimal),
              totalBalance: isHexToBn(message.totalBalance)
            };

            delete _asset.balanceDetails;

            return _asset;
          });
      });

      combineAndSetAssets(_assets);
      handleSetWorkersCall(worker, 'terminate');
    };
  }, [combineAndSetAssets, handleSetWorkersCall, userAddedEndpoints]);

  const fetchAssetOnMultiAssetChain = useCallback((addresses: string[], chainName: string) => {
    const worker: Worker = new Worker(new URL('../util/workers/getAssetOnMultiAssetChain.js', import.meta.url));

    handleSetWorkersCall(worker);
    worker.postMessage({ addresses, chainName, userAddedEndpoints });

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

      if ('metadata' in parsedMessage) {
        const metadata = parsedMessage['metadata'];

        updateMetadata(metadata as unknown as MetadataDef).catch(console.error);

        return;
      }

      const _assets: Assets = {};

      Object.keys(parsedMessage).forEach((address) => {
        _assets[address] = parsedMessage[address].map(
          (message) => {
            const temp = {
              ...message,
              ...allHexToBN(message.balanceDetails) as BalancesDetails,
              date: Date.now(),
              decimal: Number(message.decimal),
              totalBalance: isHexToBn(message.totalBalance)
            };

            delete temp.balanceDetails;

            return temp;
          });
      });

      combineAndSetAssets(_assets);
      handleSetWorkersCall(worker, 'terminate');
    };
  }, [combineAndSetAssets, handleSetWorkersCall, userAddedEndpoints]);

  const fetchMultiAssetChainAssets = useCallback((chainName: string) => {
    return addresses && fetchAssetOnMultiAssetChain(addresses, chainName);
  }, [addresses, fetchAssetOnMultiAssetChain]);

  const fetchAssets = useCallback((genesisHash: string, isSingleTokenChain: boolean, maybeMultiAssetChainName: string | undefined) => {
    /** Checking assets balances on Relay chains */
    /** and also checking assets on chains with just one native token */
    if (RELAY_CHAINS_GENESISHASH.includes(genesisHash) || isSingleTokenChain) {
      const chainName = getChainName(genesisHash, genesisOptions);

      if (!chainName) {
        console.error('can not find chain name by genesis hash!', genesisHash);

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

      const assetsToBeFetched = assetsChains[chainName]; /** we fetch asset hubs assets only if it is whitelisted via PolkaGate/apps-config */

      return fetchAssetOnAssetHubs(addresses!, chainName, assetsToBeFetched);
    }

    /** Checking assets balances on chains with more than one assets such as Acala, hydradx, etc, */
    if (maybeMultiAssetChainName) {
      fetchMultiAssetChainAssets(maybeMultiAssetChainName);
    }
  }, [addresses, fetchAssetOnAssetHubs, fetchAssetOnRelayChain, fetchMultiAssetChainAssets, genesisOptions]);

  useEffect(() => {
    if (!SHOULD_FETCH_ASSETS || !addresses || addresses.length === 0 || isWorking || isUpdate || !selectedChains || isTestnetEnabled === undefined) {
      return;
    }

    const _selectedChains = isTestnetEnabled ? selectedChains : selectedChains.filter((genesisHash) => !TEST_NETS.includes(genesisHash));
    const multipleAssetsChainsNames = Object.keys(assetsChains);

    const singleAssetChains = genesisOptions.filter(({ text, value }) =>
      _selectedChains.includes(value as string) &&
      !ASSET_HUBS.includes(value as string) &&
      !RELAY_CHAINS_GENESISHASH.includes(value as string) &&
      !multipleAssetsChainsNames.includes(toCamelCase(text) || '')
    );

    /** Fetch assets for all the selected chains by default */
    _selectedChains?.forEach((genesisHash) => {
      const isSingleTokenChain = !!singleAssetChains.find(({ value }) => value === genesisHash);
      const maybeMultiAssetChainName = multipleAssetsChainsNames.find((chainName) => chainName === getChainName(genesisHash));

      fetchAssets(genesisHash, isSingleTokenChain, maybeMultiAssetChainName);
    });
  }, [SHOULD_FETCH_ASSETS, addresses, fetchAssets, isTestnetEnabled, isUpdate, isWorking, selectedChains, genesisOptions]);

  return fetchedAssets;
}
