// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Variant } from '@mui/material/styles/createTypography';
import type { AdvancedDropdownOption } from '../../../util/types';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { Category2, People, Profile } from 'iconsax-react';
import React, { memo, useCallback, useMemo } from 'react';

import { DropSelect, MySwitch } from '../../../components';
import { useTranslation } from '../../../hooks';
import Search from '../../../popup/staking/components/Search';
import { POSITION_TABS, type PositionsAction, type PositionsState, type StakingType } from '../util/utils';

interface TabItemProps {
  isSelected: boolean;
  text: string;
  count: number;
  selector: () => void;
}

const TabItem = ({ count, isSelected, selector, text }: TabItemProps) => {
  const theme = useTheme();

  const color = useMemo(() => isSelected ? theme.palette.text.primary : '#AA83DC', [isSelected, theme.palette.text.primary]);

  return (
    <Grid container item onClick={selector} sx={{ alignItems: 'center', cursor: 'pointer', gap: '6px', height: '36px', justifyContent: 'center', width: '105px', zIndex: 1 }}>
      <Typography color={color} variant='B-6'>
        {text}
      </Typography>
      <Typography color='text.primary' sx={{ bgcolor: isSelected ? '#EAEBF1' : '#FFFFFF26', borderRadius: '1024px', color: isSelected ? '#05091C' : '#AA83DC', minHeight: '18px', minWidth: '18px' }} variant='B-1'>
        {count}
      </Typography>
    </Grid>
  );
};

interface PositionsEarningsProps {
  setter: (selectedTab: POSITION_TABS) => () => void;
  selectedTab: POSITION_TABS;
  positionsCount: number | undefined;
  earningsCount: number | undefined;
}

const PositionsEarnings = ({ earningsCount, positionsCount, selectedTab, setter }: PositionsEarningsProps) => {
  const { t } = useTranslation();

  const isSelected = useCallback((tabName: POSITION_TABS) => tabName === selectedTab, [selectedTab]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '12px', display: 'flex', flexDirection: 'row', gap: '4px', height: '44px', m: 0, p: '4px', position: 'relative', width: 'fit-content' }}>
      <TabItem
        count={positionsCount ?? 0}
        isSelected={isSelected(POSITION_TABS.POSITIONS)}
        selector={setter(POSITION_TABS.POSITIONS)}
        text={t('Positions')}
      />
      <TabItem
        count={earningsCount ?? 0}
        isSelected={isSelected(POSITION_TABS.EARNING)}
        selector={setter(POSITION_TABS.EARNING)}
        text={t('Explore')}
      />
      <Grid sx={{ background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', borderRadius: '10px', height: '36px', left: '4px', position: 'absolute', top: '4px', transform: isSelected(POSITION_TABS.EARNING) ? 'translateX(109px)' : 'none', transition: 'all ease-in-out 150ms', width: '105px' }} />
    </Container>
  );
};

interface Props {
  dispatch: React.Dispatch<PositionsAction>;
  state: PositionsState;
  positionsCount: number | undefined;
  earningsCount: number | undefined;
}

function PositionsToolbar ({ dispatch, earningsCount, positionsCount, state }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const positionOptions: AdvancedDropdownOption[] = useMemo(() => ([
    { Icon: <Profile color='#AA83DC' size='20' variant='Bulk' />, text: t('Solo Staking'), value: 'solo' },
    { Icon: <People color='#AA83DC' size='20' variant='Bulk' />, text: t('Pool Staking'), value: 'pool' },
    { Icon: <Category2 color='#AA83DC' size='20' variant='Bulk' />, text: t('Solo and Pool Staking'), value: 'both' }
  ]), [t]);

  const setter = useCallback((selectedTab: POSITION_TABS) => () => dispatch({ payload: selectedTab, type: 'SET_TAB' }), [dispatch]);
  const stakingTypeHandler = useCallback((value: string | number) => dispatch({ payload: value as StakingType, type: 'SET_STAKING_TYPE' }), [dispatch]);
  const searchHandler = useCallback((text: string) => dispatch({ payload: text, type: 'SET_SEARCH_QUERY' }), [dispatch]);
  const toggleTestnets = useCallback(() => dispatch({ type: 'TOGGLE_TESTNET' }), [dispatch]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '40px', p: '14px', width: '100%' }}>
      <PositionsEarnings earningsCount={earningsCount} positionsCount={positionsCount} selectedTab={state.tab} setter={setter} />
      {state.tab === POSITION_TABS.POSITIONS && (
        <DropSelect
          displayContentType='iconOption'
          onChange={stakingTypeHandler}
          options={positionOptions}
          style={{
            minWidth: '220px',
            width: 'fit-content'
          }}
          textVariant={'B-4' as Variant}
          value={state.stakingType}
        />)}
      <Search
        defaultValue={state.searchQuery}
        inputColor='#BEAAD8'
        onSearch={searchHandler}
        placeholder={t('Search token')}
        style={{
          '> div': {
            '& input.MuiInputBase-input': { '&::placeholder': { ...theme.typography['B-4'], color: theme.palette.text.secondary, textAlign: 'left' } },
            bgcolor: 'transparent',
            border: '1px solid #BEAAD833',
            borderRadius: '12px',
            height: 'fit-content',
            p: '6px'
          },
          width: state.tab === POSITION_TABS.POSITIONS ? '195px' : '300px'
        }}
      />
      <MySwitch
        checked={state.isTestnet}
        columnGap='6px'
        label= {t('Test Networks')}
        labelStyle={{ color: 'text.secondary', variant: 'B-4' }}
        onChange={toggleTestnets}
      />
    </Container>
  );
}

export default memo(PositionsToolbar);
