// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SavedAssets } from '@polkadot/extension-polkagate/src/hooks/useAssetsBalances';
import type { DropdownOption } from '../util/types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import EndpointManager from '../class/endpointManager';
import { getBuiltInEndpointOptions } from '../hooks/useEndpoints';
import { getStorage, setStorage } from '../util';
import { AUTO_MODE_DEFAULT_ENDPOINT, STORAGE_KEY } from '../util/constants';
import { DEFAULT_SELECTED_CHAINS } from '../util/defaultSelectedChains';
import useGenesisHashOptions from './useGenesisHashOptions';

interface UseChainSelectionSettings {
  chainsToList: DropdownOption[];
  onSearch: (keyword: string) => void;
  selectedChains: Set<string>;
  setChainSelection: (value: string, checked?: boolean) => void;
}

const endpointManager = new EndpointManager();

export default function useChainSelectionSettings(): UseChainSelectionSettings {
  const allChains = useGenesisHashOptions({});
  const chainsWithEndpoints = useMemo(
    () => allChains.filter(({ value }) => getBuiltInEndpointOptions(value as string).length > 0),
    [allChains]
  );

  const [searchedChain, setSearchedChain] = useState<DropdownOption[]>();
  const [selectedChains, setSelectedChains] = useState<Set<string>>(new Set());
  const [initialChains, setInitialChains] = useState<Set<string>>(new Set());
  const selectedChainsRef = useRef(selectedChains);
  const assetsWriteQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    selectedChainsRef.current = selectedChains;
  }, [selectedChains]);

  const sortedChainsToShow = useMemo(() => [...chainsWithEndpoints].sort((a, b) => {
    const aInSet = initialChains.has(a.value as string);
    const bInSet = initialChains.has(b.value as string);

    if (aInSet && !bInSet) {
      return -1;
    }

    if (!aInSet && bInSet) {
      return 1;
    }

    return 0;
  }), [chainsWithEndpoints, initialChains]);

  useEffect(() => {
    const defaultSelectedGenesisHashes = DEFAULT_SELECTED_CHAINS.map(({ value }) => value as string);

    getStorage(STORAGE_KEY.SELECTED_CHAINS).then((res) => {
      if (Array.isArray(res)) {
        setInitialChains(new Set(res as string[]));
      } else {
        setInitialChains(new Set(defaultSelectedGenesisHashes));
      }
    }).catch(console.error);
  }, []);

  const updateSavedAssetsInStorage = useCallback((chains: Set<string>) => {
    assetsWriteQueueRef.current = assetsWriteQueueRef.current
      .then(async() => {
        const info = await getStorage(STORAGE_KEY.ASSETS, true);
        const assets = info as SavedAssets | undefined;

        assets?.balances && Object.keys(assets.balances).forEach((addresses) => {
          Object.keys(assets.balances[addresses]).forEach((genesisHash) => {
            if (!chains.has(genesisHash)) {
              assets.balances[addresses][genesisHash] && delete assets.balances[addresses][genesisHash];
            }
          });
        });

        await setStorage(STORAGE_KEY.ASSETS, assets, true);
      })
      .catch(console.error);
  }, []);

  const handleChainsChanges = useCallback((chains: Set<string>) => {
    setStorage(STORAGE_KEY.SELECTED_CHAINS, [...chains]).catch(console.error);
    updateSavedAssetsInStorage(chains);
  }, [updateSavedAssetsInStorage]);

  const disableChainEndpoint = useCallback((genesisHash: string) => {
    endpointManager.set(genesisHash, {
      checkForNewOne: false,
      endpoint: undefined,
      isAuto: false,
      timestamp: Date.now()
    });
  }, []);

  const enableChainEndpoint = useCallback((genesisHash: string) => {
    endpointManager.set(genesisHash, {
      ...AUTO_MODE_DEFAULT_ENDPOINT,
      timestamp: Date.now()
    });
  }, []);

  useEffect(() => {
    return () => {
      handleChainsChanges(selectedChainsRef.current);
    };
  }, [handleChainsChanges]);

  useEffect(() => {
    setSelectedChains(initialChains);
  }, [initialChains]);

  const setChainSelection = useCallback((value: string, checked?: boolean) => {
    const isSelected = checked ?? !selectedChainsRef.current.has(value);
    const updatedChains = new Set(selectedChainsRef.current);

    if (isSelected) {
      updatedChains.add(value);
    } else {
      updatedChains.delete(value);
    }

    selectedChainsRef.current = updatedChains;
    handleChainsChanges(updatedChains);
    setSelectedChains(updatedChains);

    if (isSelected) {
      enableChainEndpoint(value);
    } else {
      disableChainEndpoint(value);
    }
  }, [disableChainEndpoint, enableChainEndpoint, handleChainsChanges]);

  const onSearch = useCallback((keyword: string) => {
    if (!keyword) {
      return setSearchedChain(undefined);
    }

    const normalizedKeyword = keyword.trim().toLowerCase();
    const filtered = chainsWithEndpoints.filter(({ text }) => text.toLowerCase().includes(normalizedKeyword));

    setSearchedChain([...filtered]);
  }, [chainsWithEndpoints]);

  const chainsToList = useMemo(() => searchedChain ?? sortedChainsToShow, [searchedChain, sortedChainsToShow]);

  return {
    chainsToList,
    onSearch,
    selectedChains,
    setChainSelection
  };
}
