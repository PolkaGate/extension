// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';

import { ChevronRight } from '@mui/icons-material';
import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ASSETS_NAME_IN_STORAGE, type SavedAssets } from '@polkadot/extension-polkagate/src/hooks/useAssetsBalances';
import { DEFAULT_SELECTED_CHAINS } from '@polkadot/extension-polkagate/src/util/defaultSelectedChains';

import { ChainLogo, MySwitch, SearchField } from '../../../components';
import { useGenesisHashOptions, useTranslation } from '../../../hooks';
import { getStorage, setStorage } from '../../../util';
import Endpoints from './Endpoints';

interface ItemProps {
  isLast: boolean;
  isSelected: boolean;
  text: string;
  value: string;
  onSelect: (value: string) => void
  chainEndpoints: (value: string) => () => void
}

function Item ({ chainEndpoints, isLast, isSelected, onSelect, text, value }: ItemProps): React.ReactElement {
  return (
    <Grid
      alignItems='center' container item justifyContent='space-between' key={value} sx={{
        backgroundImage: isLast ? '' : 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)',
        backgroundPosition: 'bottom',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 2px',
        borderBottom: isLast ? 0 : '1px solid transparent',
        height: '45px',
        px: '7px',
        width: '47%'
      }}
    >
      <Stack alignItems='center' className='hoverable' direction='row' onClick={chainEndpoints(value)} sx={{ cursor: 'pointer' }}>
        <ChainLogo genesisHash={value} size={24} />
        <Typography color={isSelected ? 'text.primary' : 'primary.main'} ml='8px' variant='B-1'>
          {text}
        </Typography>
        <ChevronRight sx={{
          '.hoverable:hover &': {
            transform: 'translateX(5px)'
          },
          color: isSelected ? 'text.primary' : 'primary.main',
          fontSize: '17px',
          transition: 'transform 250ms ease-out'
        }}
        />
      </Stack>
      <MySwitch
        checked={isSelected}
        // eslint-disable-next-line react/jsx-no-bind
        onChange={() => onSelect(value)}
      />
    </Grid>

  );
}

function ChainsToViewAssets (): React.ReactElement {
  const { t } = useTranslation();
  const allChains = useGenesisHashOptions(false);

  const [searchedChain, setSearchedChain] = useState<DropdownOption[]>();
  const [selectedChains, setSelectedChains] = useState<Set<string>>(new Set());
  const [initialChains, setInitialChains] = useState<Set<string>>(new Set());
  const [showEndpoints, setShowEndpoints] = useState<string>();

  const selectedChainsRef = useRef(selectedChains);

  useEffect(() => {
    // Update the ref whenever selectedChains changes
    selectedChainsRef.current = selectedChains;
  }, [selectedChains]);

  const sortedChainsToShow = useMemo(() => [...allChains].sort((a, b) => {
    const aInSet = initialChains.has(a.value as string);
    const bInSet = initialChains.has(b.value as string);

    if (aInSet && !bInSet) {
      return -1; // Move 'a' before 'b'
    } else if (!aInSet && bInSet) {
      return 1; // Move 'b' before 'a'
    } else {
      return 0; // Keep the original order
    }
  }), [allChains, initialChains]);

  useEffect(() => {
    const defaultSelectedGenesisHashes = DEFAULT_SELECTED_CHAINS.map(({ value }) => value as string);

    getStorage('selectedChains').then((res) => {
      (res as string[])?.length
        ? setInitialChains(new Set(res as string[]))
        : setInitialChains(new Set(defaultSelectedGenesisHashes));
    }).catch(console.error);
  }, [allChains]);

  const updateSavedAssetsInStorage = useCallback(() => {
    getStorage(ASSETS_NAME_IN_STORAGE, true).then((info) => {
      const assets = info as SavedAssets;

      assets && Object.keys(assets.balances).forEach((addresses) => {
        Object.keys(assets.balances[addresses]).forEach((genesisHash) => {
          if (!selectedChains.has(genesisHash)) {
            assets.balances[addresses][genesisHash] && delete assets.balances[addresses][genesisHash];
          }
        });
      });
      setStorage(ASSETS_NAME_IN_STORAGE, assets, true).catch(console.error);
    }).catch(console.error);
  }, [selectedChains]);

  const handleChainsChanges = useCallback((chains: Set<string>) => {
    setStorage('selectedChains', [...chains]).catch(console.error);
    updateSavedAssetsInStorage();
  }, [updateSavedAssetsInStorage]);

  useEffect(() => {
    // Apply chain changes function that runs on unmount
    return () => {
      console.log('apply chain changes function that runs on unmount');
      handleChainsChanges(selectedChainsRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    initialChains?.size && setSelectedChains(initialChains);
  }, [initialChains]);

  const onChainSelect = useCallback((value: string) => {
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

    keyword = keyword.trim().toLowerCase();
    const _filtered = allChains.filter(({ text }) => text.toLowerCase().includes(keyword));

    setSearchedChain([..._filtered]);
  }, [allChains]);

  const chainEndpoints = useCallback((genesisHash: string) => {
    return () => setShowEndpoints(genesisHash);
  }, []);

  const onCloseEndpoints = useCallback(() => {
    setShowEndpoints(undefined);
  }, []);

  console.log(showEndpoints);
  // const onAddNewChain = useCallback(() => {
  //   windowOpen('/addNewChain/').catch(console.error);
  // }, []);

  const chainsToList = useMemo(() => searchedChain ?? sortedChainsToShow, [searchedChain, sortedChainsToShow]);

  return (
    <Stack alignItems='flex-start' direction='column' justifyContent='flex-start' sx={{ backgroundColor: 'background.paper', borderRadius: '14px', height: '250px', overflow: 'scroll', p: '0 0 30px 20px', m: '0 4px 4px', width: '100%' }}>
      <Typography color='text.primary' fontSize='22px' m='22px 0 12px' sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase', width: '100%' }} variant='H-4'>
        {t('Networks to view assets')}
      </Typography>
      <SearchField
        onInputChange={onSearch}
        placeholder='🔍 Search networks'
        placeholderStyle={{ textAlign: 'left' }}
        style={{ paddingRight: '4%' }}
      />
      <Grid alignItems='flex-start' container direction='row' item justifyContent='space-between' sx={{ mt: '15px', width: '96%' }}>
        {chainsToList.map(({ text, value }, index) => (
          <Item
            chainEndpoints={chainEndpoints}
            isLast={chainsToList.length - 1 === index}
            isSelected={selectedChains.has(value as string)}
            key={index}
            onSelect={onChainSelect}
            text={text}
            value={String(value)}
          />
        ))}
      </Grid>
      {showEndpoints &&
        <Endpoints
          genesisHash={showEndpoints}
          onClose={onCloseEndpoints}
          open={Boolean(showEndpoints)}
        />
      }
    </Stack>
  );
}

export default React.memo(ChainsToViewAssets);
