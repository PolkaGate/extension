// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Asset } from '@polkagate/apps-config/assets/types';
import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { MetadataDef } from '@polkadot/extension-inject/types';
import type { AlertType, DropdownOption, UserAddedChains } from '../util/types';

import { createAssets } from '@polkagate/apps-config/assets';
import { Chance } from 'chance';
import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BN, isObject } from '@polkadot/util';

import { getStorage, setStorage, watchStorage } from '../components/Loading';
import { toCamelCase } from '../fullscreen/governance/utils/util';
import { updateMetadata } from '../messaging';
import { ASSET_HUBS, RELAY_CHAINS_GENESISHASH, TEST_NETS } from '../util/constants';
import getChainName from '../util/getChainName';
import { isHexToBn } from '../util/utils';
import { TIME_TO_REMOVE_ALERT } from './useAlerts';
import useSelectedChains from './useSelectedChains';
import { useIsTestnetEnabled, useTranslation } from '.';

interface WorkerMessage { functionName?: string, metadata?: MetadataDef, results?: Record<string, MessageBody[]> }
type Assets = Record<string, FetchedBalance[]>;
type AssetsBalancesPerChain = Record<string, FetchedBalance[]>;
type AssetsBalancesPerAddress = Record<string, AssetsBalancesPerChain>;
export interface SavedAssets { balances: AssetsBalancesPerAddress, timeStamp: number }

interface BalancesDetails {
  availableBalance: BN,
  freeBalance: BN,
  frozenBalance: BN,
  frozenFee?: BN,
  frozenMisc?: BN,
  lockedBalance?: BN,
  soloTotal?: BN,
  pooledBalance?: BN,
  reservedBalance: BN,
  vestingLocked?: BN,
  vestedClaimable?: BN,
  vestingTotal?: BN,
  votingBalance?: BN
}

interface MessageBody {
  assetId: number | string,
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
  assetId: number | string,
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

export const isUpToDate = (date?: number): boolean | undefined => date ? Date.now() - date < BALANCE_VALIDITY_PERIOD : undefined;

function allHexToBN (balances: object | string | undefined): BalancesDetails | object {
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

const FUNCTIONS = ['getAssetOnRelayChain', 'getAssetOnAssetHub', 'getAssetOnMultiAssetChain'];

/**
 * @description To fetch accounts assets on different selected chains
 * @param addresses a list of users accounts' addresses
 * @returns a list of assets balances on different selected chains and a fetching timestamp
 */
export default function useAssetsBalances (accounts: AccountJson[] | null, setAlerts: Dispatch<SetStateAction<AlertType[]>>, genesisOptions: DropdownOption[], userAddedEndpoints: UserAddedChains, worker?: MessagePort): SavedAssets | undefined | null {
  const { t } = useTranslation();

  const isTestnetEnabled = useIsTestnetEnabled();
  const selectedChains = useSelectedChains();
  const workerCallsCount = useRef<number>(0);

  const random = useMemo(() => new Chance(), []);

  /** to limit calling of this heavy call on just home and account details */
  const FETCH_PATHS = window.location.hash === '#/' || window.location.hash.startsWith('#/accountfs');

  /** We need to trigger address change when a new address is added, without affecting other account fields. Therefore, we use the length of the accounts array as a dependency. */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const addresses = useMemo(() => accounts?.map(({ address }) => address), [accounts?.length]);

  const [fetchedAssets, setFetchedAssets] = useState<SavedAssets | undefined | null>();
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [roundDone, setRoundDone] = useState<boolean>(false);

  const addAlert = useCallback(() => {
    const id = random.string({ length: 10 });

    setAlerts((perv) => [...perv, { id, severity: 'success', text: t('Accounts\' balances updated!') }]);
    const timeout = setTimeout(() => setAlerts((prev) => prev.filter(({ id: alertId }) => alertId !== id)), TIME_TO_REMOVE_ALERT);

    return () => clearTimeout(timeout);
  }, [random, setAlerts, t]);

  useEffect(() => {
    FETCH_PATHS && getStorage(ASSETS_NAME_IN_STORAGE, true).then((savedAssets) => {
      const _timeStamp = (savedAssets as SavedAssets)?.timeStamp;

      setIsUpdate(Boolean(isUpToDate(_timeStamp)));
    }).catch(console.error);
  }, [FETCH_PATHS]);

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
    setIsUpdate(true);
  }, [addresses, fetchedAssets, removeZeroBalanceRecords]);

  useEffect(() => {
    /** when one round fetch is done, we will save fetched assets in storage */
    if (addresses && roundDone) {
      setRoundDone(false);
      handleAccountsSaving();
      addAlert();
    }
  }, [addAlert, addresses, handleAccountsSaving, roundDone]);

  useEffect(() => {
    /** chain list may have changed */
    isUpdate && !workerCallsCount.current && selectedChains?.length && setIsUpdate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChains]);

  useEffect(() => {
    /** accounts list may have changed */
    isUpdate && !workerCallsCount.current && addresses?.length && setIsUpdate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  useEffect(() => {
    if (!FETCH_PATHS) {
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

    const unsubscribe = watchStorage(ASSETS_NAME_IN_STORAGE, setFetchedAssets, true);

    return () => {
      unsubscribe();
    };
  }, [FETCH_PATHS, addresses]);

  const handleRequestCount = useCallback((functionName: string) => {
    if (FUNCTIONS.includes(functionName) && workerCallsCount.current) {
      workerCallsCount.current--;

      if (workerCallsCount.current === 0) {
        setRoundDone(true);
      }
    }
  }, []);

  const combineAndSetAssets = useCallback((assets: Assets) => {
    if (!addresses) {
      console.info('no addresses to combine!');

      return;
    }

    setFetchedAssets((fetchedAssets) => {
      // Create a new object reference each time
      const combinedAsset = {
        ...(fetchedAssets || DEFAULT_SAVED_ASSETS),
        balances: {
          ...(fetchedAssets?.balances || DEFAULT_SAVED_ASSETS.balances)
        }
      };

      Object.keys(assets).forEach((address) => {
        if (!combinedAsset.balances[address]) {
          combinedAsset.balances[address] = {};
        }

        const { genesisHash } = assets[address][0];

        // Create a new reference for this specific balances entry
        combinedAsset.balances[address] = {
          ...(combinedAsset.balances[address] || {}),
          [genesisHash]: assets[address]
        };
      });

      // Ensure a new timestamp and object reference
      return {
        ...combinedAsset,
        timeStamp: Date.now()
      };
    });
  }, [addresses]);

  const handleWorkerMessages = useCallback(() => {
    if (!worker) {
      return;
    }

    const handleMessage = (messageEvent: MessageEvent<string>) => {
      const message = messageEvent.data;

      if (!message) {
        return; // may receive unknown messages!
      }

      const { functionName, metadata, results } = JSON.parse(message) as WorkerMessage;

      if (metadata) {
        updateMetadata(metadata).catch(console.error);

        return;
      }

      if (!functionName) {
        return;
      }

      handleRequestCount(functionName); // need to count chains instead of workers since we are using shared worker

      if (!results) {
        return;
      }

      const _assets: Assets = {};

      if (functionName === 'getAssetOnRelayChain') {
        Object.keys(results).forEach((address) => {
          /** We use index 0 because we consider each relay chain has only one asset */
          _assets[address] = [
            {
              price: undefined,
              ...results[address][0],
              ...allHexToBN(results[address][0].balanceDetails) as BalancesDetails,
              date: Date.now(),
              decimal: Number(results[address][0].decimal),
              totalBalance: isHexToBn(results[address][0].totalBalance)
            }];

          /** since balanceDetails is already converted all to BN, hence we can delete that field */
          delete _assets[address][0].balanceDetails;
        });
      }

      if (['getAssetOnAssetHub', 'getAssetOnMultiAssetChain'].includes(functionName)) {
        Object.keys(results).forEach((address) => {
          _assets[address] = results[address].map(
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
      }

      combineAndSetAssets(_assets);
    };

    worker.addEventListener('message', handleMessage);

    return () => {
      worker.removeEventListener('message', handleMessage);
    };
  }, [combineAndSetAssets, handleRequestCount, worker]);

  const fetchAssetOnRelayChain = useCallback((_addresses: string[], chainName: string) => {
    if (!worker) {
      return;
    }

    const functionName = 'getAssetOnRelayChain';

    worker.postMessage({ functionName, parameters: { address: _addresses, chainName, userAddedEndpoints } });
  }, [userAddedEndpoints, worker]);

  const fetchAssetOnAssetHubs = useCallback((_addresses: string[], chainName: string, assetsToBeFetched?: Asset[]) => {
    if (!worker) {
      return;
    }

    const functionName = 'getAssetOnAssetHub';

    worker.postMessage({ functionName, parameters: { address: _addresses, assetsToBeFetched, chainName, userAddedEndpoints } });
  }, [userAddedEndpoints, worker]);

  const fetchAssetOnMultiAssetChain = useCallback((addresses: string[], chainName: string) => {
    if (!worker) {
      return;
    }

    const functionName = 'getAssetOnMultiAssetChain';

    worker.postMessage({ functionName, parameters: { addresses, chainName, userAddedEndpoints } });
  }, [userAddedEndpoints, worker]);

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

      workerCallsCount.current++;

      return fetchAssetOnRelayChain(addresses!, chainName);
    }

    if (ASSET_HUBS.includes(genesisHash)) { /** Checking assets balances on Asset Hub chains */
      const chainName = getChainName(genesisHash);

      if (!chainName) {
        console.error('can not find chain name by genesis hash!', genesisHash);

        return;
      }

      const assetsToBeFetched = assetsChains[chainName]; /** we fetch asset hubs assets only if it is whitelisted via PolkaGate/apps-config */

      workerCallsCount.current++;

      return fetchAssetOnAssetHubs(addresses!, chainName, assetsToBeFetched);
    }

    /** Checking assets balances on chains with more than one assets such as Acala, Hydration, etc, */
    if (maybeMultiAssetChainName) {
      workerCallsCount.current++;

      fetchMultiAssetChainAssets(maybeMultiAssetChainName);
    }
  }, [addresses, fetchAssetOnAssetHubs, fetchAssetOnRelayChain, fetchMultiAssetChainAssets, genesisOptions]);

  useEffect(() => {
    if (!FETCH_PATHS || !worker || !addresses || addresses.length === 0 || workerCallsCount.current || isUpdate || !selectedChains || isTestnetEnabled === undefined) {
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

    handleWorkerMessages();

    /** Fetch assets for all the selected chains by default */
    _selectedChains?.forEach((genesisHash) => {
      const isSingleTokenChain = !!singleAssetChains.find(({ value }) => value === genesisHash);
      const maybeMultiAssetChainName = multipleAssetsChainsNames.find((chainName) => chainName === getChainName(genesisHash));

      fetchAssets(genesisHash, isSingleTokenChain, maybeMultiAssetChainName);
    });
  }, [FETCH_PATHS, addresses, fetchAssets, worker, isTestnetEnabled, isUpdate, selectedChains, genesisOptions, handleWorkerMessages]);

  return fetchedAssets;
}
