// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { AlertType, DropdownOption, FetchedBalance, UserAddedChains } from '../util/types';

import { createAssets } from '@polkagate/apps-config/assets';
import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { toCamelCase } from '../util';
import { ASSET_HUBS, RELAY_CHAINS_GENESISHASH, TEST_NETS } from '../util/constants';
import getChainName from '../util/getChainName';
import useFetchAssetsOnChains from './useFetchAssetsOnChains';
import useSavedAssetsCache from './useSavedAssetsCache';
import useSelectedChains from './useSelectedChains';
import useWorkerAssetListener from './useWorkerAssetListener';
import { useIsTestnetEnabled, useTranslation } from '.';

type Assets = Record<string, FetchedBalance[]>;
type AssetsBalancesPerChain = Record<string, FetchedBalance[]>;
export type AssetsBalancesPerAddress = Record<string, AssetsBalancesPerChain>;
export interface SavedAssets { balances: AssetsBalancesPerAddress, timeStamp: number }

export const DEFAULT_SAVED_ASSETS = { balances: {} as AssetsBalancesPerAddress, timeStamp: Date.now() };

const assetsChains = createAssets();

const FUNCTIONS = ['getAssetOnRelayChain', 'getAssetOnAssetHub', 'getAssetOnMultiAssetChain'];

/**
 * @description To fetch accounts assets on different selected chains
 * @param addresses a list of users accounts' addresses
 * @returns a list of assets balances on different selected chains and a fetching timestamp
 */
export default function useAssetsBalances (accounts: AccountJson[] | null, setAlerts: Dispatch<SetStateAction<AlertType[]>>, genesisOptions: DropdownOption[], userAddedEndpoints: UserAddedChains, worker?: MessagePort): SavedAssets | undefined | null {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const isTestnetEnabled = useIsTestnetEnabled();
  const selectedChains = useSelectedChains();
  const workerCallsCount = useRef<number>(0);

  /** to limit calling of this heavy call on just home and account details */
  const shouldFetchAssets = pathname === '/' || pathname.startsWith('/accountfs');

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

  // Provide combineAndSetAssets and handleRequestCount for hooks usage
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
        if (!combinedAsset.balances[address]) {
          combinedAsset.balances[address] = {};
        }

        const { genesisHash } = assets[address][0];

        combinedAsset.balances[address] = {
          ...(combinedAsset.balances[address] || {}),
          [genesisHash]: assets[address]
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
    selectedChains,
    setAlerts,
    setFetchedAssets,
    setIsUpdate,
    setRoundDone,
    t,
    workerCallsCount
  });

  // The rest of the logic for fetching assets on mount and when dependencies change
  useEffect(() => {
    if (!shouldFetchAssets || !worker || !addresses || addresses.length === 0 || workerCallsCount.current || isUpdate || !selectedChains) {
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

      const call = fetchAssets(genesisHash, isSingleTokenChain, maybeMultiAssetChainName);

      workerCallsCount.current += call;
    });
  }, [shouldFetchAssets, addresses, fetchAssets, worker, isTestnetEnabled, isUpdate, selectedChains, genesisOptions]);

  return fetchedAssets;
}
