// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChevronRight } from '@mui/icons-material';
import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { NothingFound } from '@polkadot/extension-polkagate/src/partials';

import { ActionButton, Logo, Motion, SearchField } from '../../../components';
import MySwitch from '../../../components/MySwitch';
import { useTranslation } from '../../../components/translate';
import useChainSelectionSettings from '../../../hooks/useChainSelectionSettings';
import { windowOpen } from '../../../messaging';

export default function Chains(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { chainsToList, onSearch, selectedChains, toggleChainSelection } = useChainSelectionSettings();

  const chainEndpoints = useCallback((genesisHash: string) => {
    return () => navigate(`/endpoints/${genesisHash}`) as void;
  }, [navigate]);

  const onAddNewChain = useCallback(() => {
    windowOpen('/settingsfs/network').catch(console.error);
  }, []);

  return (
    <Motion>
      <Grid alignItems='flex-start' container item justifyContent='flex-start' sx={{ bgcolor: 'background.paper', borderRadius: '14px', display: 'block', p: '10px' }}>
        <Grid container item>
          <SearchField
            onInputChange={onSearch}
            placeholder={t('🔍 Search networks')}
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
                <Logo genesisHash={value as string} size={24} />
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
                onChange={() => toggleChainSelection(value as string)}
              />
            </Grid>
          );
        })}
        <NothingFound
          show={chainsToList?.length === 0}
          style={{ pb: '65px' }}
          text={t('Network Not Found')}
        />
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
