// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import type { DropdownOption } from '../../../../util/types';

import { Grid, Stack, Typography, useTheme } from '@mui/material';
import { ArrowRight2, I3Dcube } from 'iconsax-react';
import React, { type MouseEventHandler, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { ActionButton, ActionContext, ChainLogo, SearchField } from '../../../../components';
import { getStorage, setStorage } from '../../../../components/Loading';
import { useTranslation } from '../../../../components/translate';
import { useGenesisHashOptions } from '../../../../hooks';
import { ASSETS_NAME_IN_STORAGE, type SavedAssets } from '../../../../hooks/useAssetsBalances';
import { windowOpen } from '../../../../messaging';
import { DEFAULT_SELECTED_CHAINS } from '../../../../util/defaultSelectedChains';
import MySwitch from '../components/Switch';

export default function ChainsToViewAssets(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);

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

  const chainEndpoints = useCallback((genesisHash: string): MouseEventHandler<SVGElement> => {
    return () => onAction(`/endpoints/${genesisHash}`);
  }, [onAction]);

  const onAddNewChain = useCallback(() => {
    windowOpen('/addNewChain').catch(console.error);
  }, []);

  return (
    <Grid container item sx={{ py: '5px' }}>
      <Grid alignItems='flex-start' container item justifyContent='flex-start' py='5px' sx={{ bgcolor: '#05091C', border: '4px solid', borderColor: '#1B133C', borderRadius: '14px', display: 'block', px: '10px' }}>
        <Stack alignItems='end' columnGap='10px' direction='row'>
          <I3Dcube color='#AA83DC' size='20px' style={{ marginTop: '5px' }} variant='Bulk' />
          <Typography color='#EAEBF1' variant='B-2'>
            {t('Chains to View Assets')}
          </Typography>
        </Stack>
        <Grid container item>
          <SearchField
            onInputChange={onSearch}
            placeholder='🔍 Search chain'
            style={{ borderRadius: '12px', height: '36px', marginBottom: '10px', marginTop: '10px' }}
          />
        </Grid>
        {(searchedChain ?? sortedChainsToShow).map(({ text, value }) => (
          <Grid
            alignItems='center' container item justifyContent='space-between' key={value} sx={{
              backgroundImage: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)',
              backgroundPosition: 'bottom',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '100% 2px',
              borderBottom: '1px solid transparent',
              height: '45px',
              px: '7px'
            }}
          >
            <Stack alignItems='center' direction='row'>
              <ChainLogo genesisHash={value as string} size={24} />
              <Typography color='#EAEBF1' ml='8px' variant='B-1'>
                {text}
              </Typography>
              <ArrowRight2 color={theme.palette.text.primary} onClick={chainEndpoints(value as string)} size='12' style={{ cursor: 'pointer' }} />
            </Stack>
            <MySwitch
              checked={selectedChains.has(value as string)}
              // eslint-disable-next-line react/jsx-no-bind
              onChange={() => onChainSelect(value as string)}
            />
          </Grid>
        ))}
      </Grid>
      <ActionButton
        contentPlacement='center'
        onClick={onAddNewChain}
        style={{
          borderRadius: '12px',
          height: '46px',
          width: '100%'
        }}
        text={{
          firstPart: t('+ Add Chain')
        }}
        variant='contained'
      />
    </Grid>
  );
}
