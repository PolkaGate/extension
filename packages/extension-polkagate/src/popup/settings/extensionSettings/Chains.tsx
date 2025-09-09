// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SavedAssets } from '@polkadot/extension-polkagate/src/hooks/useAssetsBalances';
import type { DropdownOption } from '../../../util/types';

import { ChevronRight } from '@mui/icons-material';
import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { ActionButton, ChainLogo, Motion, SearchField } from '../../../components';
import { getStorage, setStorage } from '../../../components/Loading';
import MySwitch from '../../../components/MySwitch';
import { useTranslation } from '../../../components/translate';
import { useGenesisHashOptions } from '../../../hooks';
import { windowOpen } from '../../../messaging';
import { DEFAULT_SELECTED_CHAINS } from '../../../util/defaultSelectedChains';

export default function Chains (): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const allChains = useGenesisHashOptions(false);

  const [searchedChain, setSearchedChain] = useState<DropdownOption[]>();
  const [selectedChains, setSelectedChains] = useState<Set<string>>(new Set());
  const [initialChains, setInitialChains] = useState<Set<string>>(new Set());
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
    getStorage(STORAGE_KEY.ASSETS, true).then((info) => {
      const assets = info as SavedAssets;

      assets && Object.keys(assets.balances).forEach((addresses) => {
        Object.keys(assets.balances[addresses]).forEach((genesisHash) => {
          if (!selectedChains.has(genesisHash)) {
            assets.balances[addresses][genesisHash] && delete assets.balances[addresses][genesisHash];
          }
        });
      });
      setStorage(STORAGE_KEY.ASSETS, assets, true).catch(console.error);
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
    return () => navigate(`/endpoints/${genesisHash}`) as void;
  }, [navigate]);

  const onAddNewChain = useCallback(() => {
    windowOpen('/settingsfs/network').catch(console.error);
  }, []);

  const chainsToList = useMemo(() => searchedChain ?? sortedChainsToShow, [searchedChain, sortedChainsToShow]);

  return (
    <Motion>
      <Grid alignItems='flex-start' container item justifyContent='flex-start' sx={{ bgcolor: 'background.paper', borderRadius: '14px', display: 'block', p: '10px' }}>
        <Grid container item>
          <SearchField
            onInputChange={onSearch}
            placeholder='🔍 Search chain'
            style={{ borderRadius: '12px', height: '36px', marginBottom: '10px' }}
          />
        </Grid>
        {chainsToList.map(({ text, value }, index) => {
          const isSelected = selectedChains.has(value as string);

          return (
            <Grid
              alignItems='center' container item justifyContent='space-between' key={value} sx={{
                backgroundImage: chainsToList.length - 1 === index ? '' : 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)',
                backgroundPosition: 'bottom',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '100% 2px',
                borderBottom: chainsToList.length - 1 === index ? 0 : '1px solid transparent',
                height: '45px',
                px: '7px'
              }}
            >
              <Stack alignItems='center' className='hoverable' direction='row' onClick={chainEndpoints(value as string)} sx={{ cursor: 'pointer' }}>
                <ChainLogo genesisHash={value as string} size={24} />
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
                onChange={() => onChainSelect(value as string)}
              />
            </Grid>
          );
        })}
      </Grid>
      <ActionButton
        contentPlacement='center'
        onClick={onAddNewChain}
        style={{
          borderRadius: '12px',
          height: '46px',
          marginTop: '5px',
          width: '100%'
        }}
        text={t('+ Add New Network')}
        variant='contained'
      />
    </Motion>
  );
}
