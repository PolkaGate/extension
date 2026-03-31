// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SavedAssets } from '@polkadot/extension-polkagate/src/hooks/useAssetsBalances';
import type { DropdownOption } from '../util/types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DEFAULT_SELECTED_CHAINS } from '../util/defaultSelectedChains';
import { STORAGE_KEY } from '../util/constants';
import { getStorage, setStorage } from '../util';
import useGenesisHashOptions from './useGenesisHashOptions';

interface UseChainSelectionSettings {
  chainsToList: DropdownOption[];
  onSearch: (keyword: string) => void;
  selectedChains: Set<string>;
  setChainSelection: (value: string, checked: boolean) => void;
  toggleChainSelection: (value: string) => void;
}

export default function useChainSelectionSettings(): UseChainSelectionSettings {
  const allChains = useGenesisHashOptions();

  const [searchedChain, setSearchedChain] = useState<DropdownOption[]>();
  const [selectedChains, setSelectedChains] = useState<Set<string>>(new Set());
  const [initialChains, setInitialChains] = useState<Set<string>>(new Set());
  const selectedChainsRef = useRef(selectedChains);

  useEffect(() => {
    selectedChainsRef.current = selectedChains;
  }, [selectedChains]);

  const sortedChainsToShow = useMemo(() => [...allChains].sort((a, b) => {
    const aInSet = initialChains.has(a.value as string);
    const bInSet = initialChains.has(b.value as string);

    if (aInSet && !bInSet) {
      return -1;
    }

    if (!aInSet && bInSet) {
      return 1;
    }

    return 0;
  }), [allChains, initialChains]);

  useEffect(() => {
    const defaultSelectedGenesisHashes = DEFAULT_SELECTED_CHAINS.map(({ value }) => value as string);

    getStorage(STORAGE_KEY.SELECTED_CHAINS).then((res) => {
      (res as string[])?.length
        ? setInitialChains(new Set(res as string[]))
        : setInitialChains(new Set(defaultSelectedGenesisHashes));
    }).catch(console.error);
  }, []);

  const updateSavedAssetsInStorage = useCallback((chains: Set<string>) => {
    getStorage(STORAGE_KEY.ASSETS, true).then((info) => {
      const assets = info as SavedAssets | undefined;

      assets?.balances && Object.keys(assets.balances).forEach((addresses) => {
        Object.keys(assets.balances[addresses]).forEach((genesisHash) => {
          if (!chains.has(genesisHash)) {
            assets.balances[addresses][genesisHash] && delete assets.balances[addresses][genesisHash];
          }
        });
      });

      setStorage(STORAGE_KEY.ASSETS, assets, true).catch(console.error);
    }).catch(console.error);
  }, []);

  const handleChainsChanges = useCallback((chains: Set<string>) => {
    setStorage(STORAGE_KEY.SELECTED_CHAINS, [...chains]).catch(console.error);
    updateSavedAssetsInStorage(chains);
  }, [updateSavedAssetsInStorage]);

  useEffect(() => {
    return () => {
      handleChainsChanges(selectedChainsRef.current);
    };
  }, [handleChainsChanges]);

  useEffect(() => {
    initialChains.size && setSelectedChains(initialChains);
  }, [initialChains]);

  const setChainSelection = useCallback((value: string, checked: boolean) => {
    setSelectedChains((prevChains) => {
      const updatedChains = new Set(prevChains);

      if (checked) {
        updatedChains.add(value);
      } else {
        updatedChains.delete(value);
      }

      return updatedChains;
    });
  }, []);

  const toggleChainSelection = useCallback((value: string) => {
    setSelectedChains((prevChains) => {
      const updatedChains = new Set(prevChains);

      if (updatedChains.has(value)) {
        updatedChains.delete(value);
      } else {
        updatedChains.add(value);
      }

      return updatedChains;
    });
  }, []);

  const onSearch = useCallback((keyword: string) => {
    if (!keyword) {
      return setSearchedChain(undefined);
    }

    const normalizedKeyword = keyword.trim().toLowerCase();
    const filtered = allChains.filter(({ text }) => text.toLowerCase().includes(normalizedKeyword));

    setSearchedChain([...filtered]);
  }, [allChains]);

  const chainsToList = useMemo(() => searchedChain ?? sortedChainsToShow, [searchedChain, sortedChainsToShow]);

  return {
    chainsToList,
    onSearch,
    selectedChains,
    setChainSelection,
    toggleChainSelection
  };
}
