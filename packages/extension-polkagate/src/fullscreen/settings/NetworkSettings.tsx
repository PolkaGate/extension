// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChevronRight } from '@mui/icons-material';
import { Grid, Stack, Typography } from '@mui/material';
import { Add } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { NothingFound } from '@polkadot/extension-polkagate/src/partials';
import VelvetBox from '@polkadot/extension-polkagate/src/style/VelvetBox';
import { ExtensionPopups } from '@polkadot/extension-polkagate/src/util/constants';
import { useExtensionPopups } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';

import { Logo, Motion, MySwitch, SearchField } from '../../components';
import { useTranslation } from '../../hooks';
import useChainSelectionSettings from '../../hooks/useChainSelectionSettings';
import Endpoints from './partials/Endpoints';
import AddNewNetwork from './AddNewNetwork';

interface ItemProps {
  isLast: boolean;
  isEnabled: boolean;
  text: string;
  value: string;
  onSelect: ((event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void);
  chainEndpoints: (value: string) => () => void;
}

function Item({ chainEndpoints, isEnabled, isLast, onSelect, text, value }: ItemProps): React.ReactElement {
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
        <Logo genesisHash={value} size={24} />
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

function AddButton(): React.ReactElement {
  const { t } = useTranslation();
  const { extensionPopup, extensionPopupCloser, extensionPopupOpener } = useExtensionPopups();

  return (
    <>
      <VelvetBox style={{ minWidth: 'fit-content', width: 'auto' }}>
        <Stack direction='row' onClick={extensionPopupOpener(ExtensionPopups.NEW_NETWORK)} sx={{ '&:hover': { bgcolor: '#2D1E4A', transform: 'translateY(-1px)' }, alignItems: 'center', bgcolor: 'background.default', borderRadius: '14px', columnGap: '3px', cursor: 'pointer', height: '40px', p: '0 15px 0 5px', transition: 'all 250ms ease-out', width: '100%' }}>
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

function NetworkSettings(): React.ReactElement {
  const { t } = useTranslation();
  const { chainsToList, onSearch, selectedChains, setChainSelection } = useChainSelectionSettings();
  const [chainToShowEndpoints, setShowEndpoints] = useState<string>();

  const onChainSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const value = event.target.value;

    setChainSelection(value, checked);
  }, [setChainSelection]);

  const chainEndpoints = useCallback((genesisHash: string) => {
    return () => setShowEndpoints(genesisHash);
  }, []);

  const onCloseEndpoints = useCallback(() => {
    setShowEndpoints(undefined);
  }, []);

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
            text={t('Network Not Found')}
          />
        </Grid>
        {chainToShowEndpoints &&
          <Endpoints
            genesisHash={chainToShowEndpoints}
            isEnabled={selectedChains.has(chainToShowEndpoints)}
            onClose={onCloseEndpoints}
            onEnableChain={setChainSelection}
            open={Boolean(chainToShowEndpoints)}
          />
        }
      </Stack>
    </Motion>
  );
}

export default React.memo(NetworkSettings);
