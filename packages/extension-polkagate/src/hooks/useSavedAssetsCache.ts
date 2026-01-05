// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';

import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo } from 'react';

import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { getStorage, setStorage } from '../components/Loading';
import { removeZeroBalanceRecords } from '../util';
import { DEFAULT_SAVED_ASSETS, type SavedAssets } from './useAssetsBalances';
import { useAlerts } from '.';

const BALANCE_VALIDITY_PERIOD = 1 * 1000 * 60;

export const isUpToDate = (date?: number): boolean | undefined => date ? Date.now() - date < BALANCE_VALIDITY_PERIOD : undefined;

interface Params {
  addresses: string[] | undefined;
  fetchedAssets: SavedAssets | undefined | null;
  setFetchedAssets: Dispatch<SetStateAction<SavedAssets | undefined | null>>;
  setIsUpdate: Dispatch<SetStateAction<boolean>>;
  roundDone: boolean;
  setRoundDone: Dispatch<SetStateAction<boolean>>;
  t: (key: string) => string;
  workerCallsCount: React.MutableRefObject<number>;
  selectedChains: string[] | undefined;
}

/**
 * Hook to handle saving and loading assets from localStorage.
 */
export default function useSavedAssetsCache ({ addresses,
  fetchedAssets,
  roundDone,
  selectedChains,
  setFetchedAssets,
  setIsUpdate,
  setRoundDone,
  t,
  workerCallsCount }: Params) {
  const { notify } = useAlerts();

  // Alert function
  const addAlert = useCallback(() => {
   notify(t("Accounts' balances updated!"), 'success');
  }, [notify, t]);

  // Save assets to storage
  const handleAccountsSaving = useCallback(() => {
    const toBeSavedAssets = fetchedAssets || DEFAULT_SAVED_ASSETS;
    const addressesInToBeSavedAssets = Object.keys((toBeSavedAssets)?.balances || []);
    const addressesWithoutBalance = addresses?.filter((address) => !addressesInToBeSavedAssets.includes(address)) || [];

    addressesWithoutBalance.forEach((address) => {
      toBeSavedAssets.balances[address] = {};
    });
    const updatedAssetsToBeSaved = removeZeroBalanceRecords(toBeSavedAssets);

    // console.log('roundDone : setFetchedAssets in handleAccountsSaving:', updatedAssetsToBeSaved);

    setFetchedAssets(updatedAssetsToBeSaved);
    setStorage(STORAGE_KEY.ASSETS, updatedAssetsToBeSaved, true).catch(console.error);
    setIsUpdate(true);
  }, [addresses, fetchedAssets, setFetchedAssets, setIsUpdate]);

  // Check if cache is up to date on mount
  useEffect(() => {
    getStorage(STORAGE_KEY.ASSETS, true).then((savedAssets) => {
      const _timeStamp = (savedAssets as SavedAssets)?.timeStamp;

      setIsUpdate(Boolean(isUpToDate(_timeStamp)));
    }).catch(console.error);
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save fetched assets after round is done
  useEffect(() => {
    if (addresses && roundDone) {
      setRoundDone(false);
      handleAccountsSaving();
      addAlert();
    }
  }, [addresses, roundDone, setRoundDone, handleAccountsSaving, addAlert]);

  const upToDate = useMemo(() => isUpToDate(fetchedAssets?.timeStamp), [fetchedAssets]);

  // Reset isUpdate when selectedChains change
  useEffect(() => {
    if (upToDate && !workerCallsCount.current && selectedChains?.length) {
      setIsUpdate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChains]);

  // Reset isUpdate when addresses change
  useEffect(() => {
    if (upToDate && !workerCallsCount.current && addresses?.length) {
      setIsUpdate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  // Load saved assets from storage
  useEffect(() => {
    if (!addresses || addresses.length === 0) {
      console.warn('No addresses available — skipping fetchAssets loading');

      return;
    }

    getStorage(STORAGE_KEY.ASSETS, true)
      .then((savedAssets: unknown) => {
        if (typeof savedAssets === 'object' && savedAssets && 'balances' in savedAssets) {
          const _savedAssets = savedAssets as SavedAssets;

          if (Object.keys(_savedAssets.balances || {}).length > 0) {
            setFetchedAssets(_savedAssets);
          } else {
            console.warn('Skipping setFetchedAssets due to empty balances in savedAssets');
          }
        } else {
          console.warn('Skipping setFetchedAssets due to invalid savedAssets format');
        }
      })
      .catch(console.error);
  }, [addresses, setFetchedAssets]);
}
