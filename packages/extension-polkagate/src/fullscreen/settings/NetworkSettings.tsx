// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';

import { ChevronRight } from '@mui/icons-material';
import { Grid, Stack, Typography } from '@mui/material';
import { Add } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { type SavedAssets } from '@polkadot/extension-polkagate/src/hooks/useAssetsBalances';
import { NothingFound } from '@polkadot/extension-polkagate/src/partials';
import VelvetBox from '@polkadot/extension-polkagate/src/style/VelvetBox';
import { ExtensionPopups, STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { DEFAULT_SELECTED_CHAINS } from '@polkadot/extension-polkagate/src/util/defaultSelectedChains';
import { useExtensionPopups } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';

import { ChainLogo, Motion, MySwitch, SearchField } from '../../components';
import { useGenesisHashOptions, useTranslation } from '../../hooks';
import { getStorage, setStorage } from '../../util';
import AddNewNetwork from './partials/AddNewNetwork';
import Endpoints from './partials/Endpoints';

interface ItemProps {
  isLast: boolean;
  isEnabled: boolean;
  text: string;
  value: string;
  onSelect: ((event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void);
  chainEndpoints: (value: string) => () => void;
}

function Item ({ chainEndpoints, isEnabled, isLast, onSelect, text, value }: ItemProps): React.ReactElement {
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
        <Typography color={isEnabled ? 'text.primary' : 'primary.main'} ml='8px' variant='B-1'>
          {text}
        </Typography>
        <ChevronRight sx={{
          '.hoverable:hover &': {
            transform: 'translateX(5px)'
          },
          color: isEnabled ? 'text.primary' : 'primary.main',
          fontSize: '17px',
          transition: 'transform 250ms ease-out'
        }}
        />
      </Stack>
      <MySwitch
        checked={isEnabled}
        onChange={onSelect}
        value={value}
      />
    </Grid>

  );
}

function AddButton (): React.ReactElement {
  const { t } = useTranslation();
  const { extensionPopup, extensionPopupCloser, extensionPopupOpener } = useExtensionPopups();

  return (
    <>
      <VelvetBox style={{ minWidth: '165px', width: 'fit-content' }}>
        <Stack direction='row' onClick={extensionPopupOpener(ExtensionPopups.NEW_NETWORK)} sx={{ '&:hover': { bgcolor: '#2D1E4A', transform: 'translateY(-1px)' }, alignItems: 'center', bgcolor: 'background.default', borderRadius: '14px', columnGap: '3px', cursor: 'pointer', height: '40px', px: '5px', transition: 'all 250ms ease-out' }}>
          <Add color='#FF4FB9' size='24' variant='Linear' />
          <Typography color='text.primary' sx={{ textWrap: 'nowrap', width: 'fit-content' }} variant='B-6'>
            {t('Add New Network')}
          </Typography>
        </Stack>
      </VelvetBox>
      {extensionPopup === ExtensionPopups.NEW_NETWORK &&
        <AddNewNetwork
          closePopup={extensionPopupCloser}
        />
      }
    </>
  );
}

function NetworkSettings (): React.ReactElement {
  const { t } = useTranslation();
  const allChains = useGenesisHashOptions(false);

  const [searchedChain, setSearchedChain] = useState<DropdownOption[]>();
  const [selectedChains, setSelectedChains] = useState<Set<string>>(new Set());
  const [initialChains, setInitialChains] = useState<Set<string>>(new Set());
  const [chainToShowEndpoints, setShowEndpoints] = useState<string>();

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

    getStorage(STORAGE_KEY.SELECTED_CHAINS).then((res) => {
      (res as string[])?.length
        ? setInitialChains(new Set(res as string[]))
        : setInitialChains(new Set(defaultSelectedGenesisHashes));
    }).catch(console.error);
  }, [allChains]);

  const updateSavedAssetsInStorage = useCallback(() => {
    getStorage(STORAGE_KEY.ASSETS, true).then((info) => {
      const assets = info as SavedAssets | undefined;

      assets?.balances && Object.keys(assets.balances).forEach((addresses) => {
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
    setStorage(STORAGE_KEY.SELECTED_CHAINS, [...chains]).catch(console.error);
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

  const applyChainSelect = useCallback((value: string, checked: boolean) => {
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

  const onChainSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const value = event.target.value;

    applyChainSelect(value, checked);
  }, [applyChainSelect]);

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

  const chainsToList = useMemo(() => searchedChain ?? sortedChainsToShow, [searchedChain, sortedChainsToShow]);

  return (
    <Motion variant='slide'>
      <Stack alignItems='flex-start' direction='column' justifyContent='flex-start' sx={{ backgroundColor: 'background.paper', borderRadius: '14px', m: '5px', maxHeight: 'calc(100vh - 195px)', minHeight: '600px', overflow: 'auto', p: '0 0 30px 20px', width: 'fill-available' }}>
        <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ my: '5px' }} width='95.5%'>
          <Typography color='text.primary' fontSize='22px' m='22px 0 12px' sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase', width: '100%' }} variant='H-4'>
            {t('Networks to view assets')}
          </Typography>
          <AddButton />
        </Stack>
        <SearchField
          focused
          onInputChange={onSearch}
          placeholder={t('🔍 Search networks')}
          placeholderStyle={{ textAlign: 'left' }}
          style={{ paddingRight: '4%' }}
        />
        <Grid alignItems='flex-start' container direction='row' item justifyContent='space-between' sx={{ mt: '15px', width: '96%' }}>
          {chainsToList.map(({ text, value }, index) => (
            <Item
              chainEndpoints={chainEndpoints}
              isEnabled={selectedChains.has(value as string)}
              isLast={chainsToList.length - 1 === index}
              key={index}
              onSelect={onChainSelect}
              text={text}
              value={String(value)}
            />
          ))}
          <NothingFound
            show={chainsToList.length === 0}
            size={200}
            style={{ pt: '100px' }}
            text={t('Chain Not Found')}
          />
        </Grid>
        {chainToShowEndpoints &&
          <Endpoints
            genesisHash={chainToShowEndpoints}
            isEnabled={selectedChains.has(chainToShowEndpoints)}
            onClose={onCloseEndpoints}
            onEnableChain={applyChainSelect}
            open={Boolean(chainToShowEndpoints)}
          />
        }
      </Stack>
    </Motion>
  );
}

export default React.memo(NetworkSettings);
