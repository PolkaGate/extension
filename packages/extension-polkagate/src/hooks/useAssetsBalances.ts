// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { DropdownOption, FetchedBalance, UserAddedChains } from '../util/types';

import { createAssets } from '@polkagate/apps-config/assets';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { setStorage, toCamelCase, updateStorage } from '../util';
import { ASSET_HUBS, FETCHING_ASSETS_FUNCTION_NAMES, RELAY_CHAINS_GENESISHASH, STORAGE_KEY, TEST_NETS } from '../util/constants';
import { DEFAULT_SELECTED_CHAINS } from '../util/defaultSelectedChains';
import getChainName from '../util/getChainName';
import { isMigratedRelay, mapHubToRelay } from '../util/migrateHubUtils';
import useFetchAssetsOnChains from './useFetchAssetsOnChains';
import useIsTestnetEnabled from './useIsTestnetEnabled';
import useSavedAssetsCache from './useSavedAssetsCache';
import useSelectedChains from './useSelectedChains';
import useTranslation from './useTranslation';
import useWorkerAssetListener from './useWorkerAssetListener';

type Assets = Record<string, FetchedBalance[]>;
type AssetsBalancesPerChain = Record<string, FetchedBalance[]>;
export type AssetsBalancesPerAddress = Record<string, AssetsBalancesPerChain>;
export interface SavedAssets { balances: AssetsBalancesPerAddress, timeStamp: number }

export const DEFAULT_SAVED_ASSETS = { balances: {} as AssetsBalancesPerAddress, timeStamp: Date.now() };

const assetsChains = createAssets();

const FUNCTIONS = Object.values(FETCHING_ASSETS_FUNCTION_NAMES);

 /*
 * @description
 * React hook for fetching, combining, caching, and managing asset balances
 * across multiple Polkadot ecosystem chains for one or more accounts.
 *
 * It supports:
 * - Multi-chain asset fetching via workers
 * - AssetHub → RelayChain mapping
 * - Testnet filtering
 * - Auto-selection of chains with non-zero balances
 * - Caching and storage sync
 * - Incremental worker-based updates
 *
 * @param {Object} params
 * @param {AccountJson[] | null} params.accounts
 *        List of user accounts to fetch balances for.
 *
 * @param {DropdownOption[]} params.genesisOptions
 *        All available chain options (genesisHash-based).
 *
 * @param {UserAddedChains} params.userAddedEndpoints
 *        User-defined custom chain endpoints.
 *
 * @param {MessagePort} [params.worker]
 *        Web worker port used for parallel asset fetching.
 *
 * @param {boolean} [params.isExtensionLocked]
 *        Whether the extension is currently locked.
 *
 * @param {boolean} [params.checkAllChains]
 *        If true, fetches balances on all chains and automatically
 *        updates selected chains based on non-zero balances.
 *
 * @returns {SavedAssets | undefined | null}
 * - `SavedAssets` when balances are available
 * - `undefined` while loading
 * - `null` if fetching is disabled or not applicable
 *
 * @example
 * const assets = useAssetsBalances({
 *   accounts,
 *   genesisOptions,
 *   userAddedEndpoints,
 *   worker,
 *   isExtensionLocked,
 *   checkAllChains: true
 * });
 *
 * if (assets?.balances) {
 *   console.log(assets.timeStamp);
 * }
 */
export default function useAssetsBalances({ accounts,
  checkAllChains,
  genesisOptions,
  isExtensionLocked,
  userAddedEndpoints,
  worker }: {
    accounts: AccountJson[] | null;
    genesisOptions: DropdownOption[];
    userAddedEndpoints: UserAddedChains;
    worker?: MessagePort;
    isExtensionLocked?: boolean;
    checkAllChains?: boolean;
  }): SavedAssets | undefined | null {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const isTestnetEnabled = useIsTestnetEnabled();
  const selectedChains = useSelectedChains();
  const chainsToFetchAssets = (checkAllChains ? genesisOptions.map(({ value }) => value).filter(Boolean) : selectedChains) as string[];
  const workerCallsCount = useRef<number>(0);

  /** To limit calling of this heavy call on just home and account details */
  const shouldFetchAssets = !isExtensionLocked && (pathname === '/' || pathname.startsWith('/accountfs'));

  /** We need to trigger address change when a new address is added, without affecting other account fields. Therefore, we use the length of the accounts array as a dependency. */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const addresses = useMemo(() => accounts?.map(({ address }) => address), [accounts?.length]);

  const [fetchedAssets, setFetchedAssets] = useState<SavedAssets | undefined | null>();
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [roundDone, setRoundDone] = useState<boolean>(false);

  // useFetchAssetsOnChains returns fetchAssets and the fetch logic
  const { fetchAssets } = useFetchAssetsOnChains({
    addresses,
    genesisOptions,
    userAddedEndpoints,
    worker
  });

  // Add chains which user has assets on to user selected chains on account imports
  useEffect(() => {
    if (!checkAllChains) {
      return;
    }

    const nonZeroGenesisHashes = new Set<string>(
      Object.values(fetchedAssets?.balances ?? {}) // accounts
        .flatMap((accountAssets) =>
          Object.entries(accountAssets) // [genesisHash, assets[]]
            .filter(([_, assets]) =>
              assets.some((asset) => Number(asset.totalBalance) > 0)
            )
            .map(([genesisHash]) => genesisHash)
        )
    );

    // Include Asset Hubs as well, since balances are still indexed by the relay chain
    DEFAULT_SELECTED_CHAINS.forEach(({ value }) => {
      nonZeroGenesisHashes.add(value as string);
    });
    updateStorage(STORAGE_KEY.SELECTED_CHAINS, [...nonZeroGenesisHashes], true) as unknown as void;

    if (roundDone) {
      setStorage(STORAGE_KEY.CHECK_BALANCE_ON_ALL_CHAINS, false) as unknown as void;
    }
  }, [checkAllChains, fetchedAssets?.balances, roundDone]);

  // Provide combineAndSetAssets and handle Request Count for hooks usage
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

    // console.log('setFetchedAssets in combineAndSetAssets:', assets);

    setFetchedAssets((prev) => {
      const combinedAsset = {
        ...(prev || DEFAULT_SAVED_ASSETS),
        balances: {
          ...(prev?.balances || DEFAULT_SAVED_ASSETS.balances)
        }
      };

      Object.keys(assets).forEach((address) => {
        const { genesisHash } = assets[address][0];

        if (isMigratedRelay(genesisHash)) {
          // console.debug(` ${genesisHash} is migrated`);

          return;
        }

        if (!combinedAsset.balances[address]) {
          combinedAsset.balances[address] = {};
        }

        const _mappedGenesisHash = mapHubToRelay(genesisHash) as unknown as string;

        if (_mappedGenesisHash !== genesisHash) {
          assets[address].forEach((asset) => {
            asset.chainName = asset.chainName.replace('AssetHub', '');
          });
        }

        combinedAsset.balances[address] = {
          ...(combinedAsset.balances[address] || {}),
          [_mappedGenesisHash]: assets[address]
        };
      });

      return {
        ...combinedAsset,
        timeStamp: Date.now()
      };
    });
  }, [addresses]);

  // useWorkerAssetListener sets up worker message listener
  useWorkerAssetListener(worker, handleRequestCount, combineAndSetAssets);

  // useSavedAssetsCache handles saving/loading assets from cache
  useSavedAssetsCache({
    addresses,
    fetchedAssets,
    roundDone,
    selectedChains: chainsToFetchAssets,
    setFetchedAssets,
    setIsUpdate,
    setRoundDone,
    t,
    workerCallsCount
  });

  // The rest of the logic for fetching assets on mount and when dependencies change
  useEffect(() => {
    if (!shouldFetchAssets || !worker || !addresses || addresses.length === 0 || workerCallsCount.current || isUpdate || !chainsToFetchAssets) {
      return;
    }

    const _selectedChains = isTestnetEnabled ? chainsToFetchAssets : chainsToFetchAssets.filter((genesisHash) => !TEST_NETS.includes(genesisHash));
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

      const call = fetchAssets(genesisHash, isSingleTokenChain, maybeMultiAssetChainName);

      workerCallsCount.current += call;
    });
  }, [shouldFetchAssets, addresses, fetchAssets, worker, isTestnetEnabled, isUpdate, chainsToFetchAssets, genesisOptions]);

  return fetchedAssets;
}
