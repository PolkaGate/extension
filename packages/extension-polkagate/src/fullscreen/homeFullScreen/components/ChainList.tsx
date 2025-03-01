// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { SavedAssets } from '../../../hooks/useAssetsBalances';
import type { DropdownOption } from '../../../util/types';

import { AddCircle as AddIcon, RestartAlt as ResetIcon } from '@mui/icons-material';
import { Button, Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { InputFilter } from '../../../components';
import { getStorage, setStorage } from '../../../components/Loading';
import { useGenesisHashOptions, useIsTestnetEnabled, useTranslation } from '../../../hooks';
import { ASSETS_NAME_IN_STORAGE } from '../../../hooks/useAssetsBalances';
import { TEST_NETS } from '../../../util/constants';
import { DEFAULT_SELECTED_CHAINS } from '../../../util/defaultSelectedChains';
import { openOrFocusTab } from '../../accountDetails/components/CommonTasks';
import ChainItem from './ChainItem';

interface Props {
  anchorEl: HTMLButtonElement | null;
}

function ChainList({ anchorEl }: Props): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const allChains = useGenesisHashOptions(false);
  const isTestnetEnabled = useIsTestnetEnabled();

  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [searchedChain, setSearchedChain] = useState<DropdownOption[]>();
  const [selectedChains, setSelectedChains] = useState<Set<string>>(new Set());
  const [initialChains, setInitialChains] = useState<Set<string>>(new Set());

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

  const handleChainsChanges = useCallback(() => {
    setStorage('selectedChains', [...selectedChains]).catch(console.error);
    updateSavedAssetsInStorage();
  }, [selectedChains, updateSavedAssetsInStorage]);

  useEffect(() => {
    if (anchorEl === null) {
      setSearchKeyword('');
      selectedChains?.size &&
        handleChainsChanges();
    }
  }, [anchorEl, handleChainsChanges, selectedChains]);

  useEffect(() => {
    initialChains?.size && setSelectedChains(initialChains);
  }, [initialChains]);

  const onChainSelect = useCallback((chain: DropdownOption) => {
    setSelectedChains((prevChains) => {
      const updatedChains = new Set(prevChains);

      if (updatedChains.has(chain.value as string)) {
        updatedChains.delete(chain.value as string);
      } else {
        updatedChains.add(chain.value as string);
      }

      return updatedChains;
    });
  }, []);

  const onSearch = useCallback((keyword: string) => {
    if (!keyword) {
      setSearchKeyword('');

      return setSearchedChain(undefined);
    }

    setSearchKeyword(keyword);
    keyword = keyword.trim().toLowerCase();

    const _filtered = allChains.filter(({ text }) => text.toLowerCase().includes(keyword));

    setSearchedChain([..._filtered]);
  }, [allChains]);

  const onAddNewChain = useCallback(() => {
    openOrFocusTab('/addNewChain', true);
  }, []);

  const onReset = useCallback(() => {
    const defaultSelectedGenesisHashes = DEFAULT_SELECTED_CHAINS.map(({ value }) => value as string);

    setInitialChains(new Set(defaultSelectedGenesisHashes));
    setStorage('selectedChains', defaultSelectedGenesisHashes).catch(console.error);
    updateSavedAssetsInStorage();
  }, [updateSavedAssetsInStorage]);

  return (
    <Grid container item sx={{ width: '280px' }}>
      <Grid container item justifyContent='space-between' px='10px'>
        <Typography color='secondary.contrastText' fontSize='14px' fontWeight={400} py='10px' textAlign='center' width='100%'>
          {t('Select chains to view assets on')}
        </Typography>
        <Button
          onClick={onAddNewChain}
          startIcon={<AddIcon />}
          sx={{ '&:hover': { bgcolor: 'divider' }, '.MuiButton-startIcon': { marginRight: '2px' }, color: theme.palette.secondary.light, fontSize: '12px', fontWeight: 300, ml: '10px', p: 0, textTransform: 'none', width: 'fit-content' }}
          variant='text'
        >
          {t('Add a new chain')}
        </Button>
        <Button
          onClick={onReset}
          startIcon={<ResetIcon />}
          sx={{ '&:hover': { bgcolor: 'divider' }, '.MuiButton-startIcon': { marginRight: '2px' }, color: theme.palette.secondary.light, fontSize: '12px', fontWeight: 300, p: 0, textTransform: 'none', width: 'fit-content' }}
          variant='text'
        >
          {t('Reset')}
        </Button>
      </Grid>
      <Divider sx={{ bgcolor: 'divider', height: '2px', mb: '5px', width: '100%' }} />
      <Grid container p='5px' sx={{ display: 'list-item' }}>
        <InputFilter
          autoFocus
          fontSize='14px'
          onChange={onSearch}
          placeholder={t('🔍 Search chain')}
          theme={theme}
          value={searchKeyword ?? ''}
        />
      </Grid>
      <Grid container item sx={{ maxHeight: 'calc(100vh - 200px)', overflow: 'hidden', overflowY: 'scroll', transition: 'height 5000ms ease-in-out' }}>
        {(searchedChain ?? sortedChainsToShow).map((item, index) => (
          <ChainItem
            chain={item}
            disabled={!isTestnetEnabled && TEST_NETS.includes(item.value as string)}
            isSelected={selectedChains.has(item.value as string)}
            key={index}
            onclick={onChainSelect}
          />
        ))}
      </Grid>
    </Grid>

  );
}

export default React.memo(ChainList);
