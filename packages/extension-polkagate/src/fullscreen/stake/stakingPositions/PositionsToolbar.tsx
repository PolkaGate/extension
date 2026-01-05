// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Variant } from '@mui/material/styles/createTypography';
import type { ForwardedRef } from 'react';
import type { AdvancedDropdownOption } from '../../../util/types';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { Category2, People, Profile } from 'iconsax-react';
import React, { memo, useCallback, useEffect, useMemo } from 'react';

import { DropSelect, MySwitch } from '../../../components';
import { useIsTestnetEnabled, useTranslation } from '../../../hooks';
import Search from '../../../popup/staking/components/Search';
import { POSITION_TABS, type PositionsAction, type PositionsState, type StakingType } from '../util/utils';

interface TabItemProps {
  isSelected: boolean;
  text: string;
  count: number;
  selector: () => void;
}

const TabItem = React.forwardRef<HTMLDivElement, TabItemProps>(
  ({ count, isSelected, selector, text }, ref: ForwardedRef<HTMLDivElement>) => {
    const theme = useTheme();

    const color = useMemo(() => isSelected ? theme.palette.text.primary : '#AA83DC', [isSelected, theme.palette.text.primary]);

    return (
      <Grid
        container
        item
        onClick={selector}
        ref={ref}
        sx={{
          alignItems: 'center',
          cursor: 'pointer',
          gap: '6px',
          height: '36px',
          justifyContent: 'center',
          minWidth: '105px',
          px: '7px',
          width: 'fit-content',
          zIndex: 1
        }}
      >
        <Typography color={color} variant='B-6'>
          {text}
        </Typography>
        <Typography color='text.primary' sx={{ bgcolor: isSelected ? '#EAEBF1' : '#FFFFFF26', borderRadius: '1024px', color: isSelected ? '#05091C' : '#AA83DC', minHeight: '18px', minWidth: '18px' }} variant='B-1'>
          {count}
        </Typography>
      </Grid>
    );
  }
);

TabItem.displayName = 'TabItem';

interface PositionsExploreProps {
  setter: (selectedTab: POSITION_TABS) => () => void;
  selectedTab: POSITION_TABS;
  positionsCount: number | undefined;
  earningsCount: number | undefined;
}

const PositionsExplore = ({ earningsCount, positionsCount, selectedTab, setter }: PositionsExploreProps) => {
  const { t } = useTranslation();
  const positionsRef = React.useRef<HTMLDivElement>(null);
  const exploreRef = React.useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState<{ left: number; width: number }>({ left: 4, width: 0 });

  const isSelected = useCallback((tabName: POSITION_TABS) => tabName === selectedTab, [selectedTab]);

  useEffect(() => {
    // Find the selected tab's DOM node and update the indicator's position and width
    let ref: React.RefObject<HTMLDivElement | null>;

    if (selectedTab === POSITION_TABS.POSITIONS) {
      ref = positionsRef;
    } else {
      ref = exploreRef;
    }

    const positionsRect = positionsRef.current?.parentElement?.getBoundingClientRect();
    const tabRect = ref.current?.getBoundingClientRect();

    if (tabRect && positionsRect) {
      setIndicatorStyle({
        left: tabRect.left - positionsRect.left,
        width: tabRect.width
      });
    }
  }, [selectedTab, positionsCount, earningsCount, t]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '12px', display: 'flex', flexDirection: 'row', gap: '4px', height: '44px', m: 0, p: '4px', position: 'relative', width: 'fit-content' }}>
      <TabItem
        count={positionsCount ?? 0}
        isSelected={isSelected(POSITION_TABS.POSITIONS)}
        ref={positionsRef}
        selector={setter(POSITION_TABS.POSITIONS)}
        text={t('My Positions')}
      />
      <TabItem
        count={earningsCount ?? 0}
        isSelected={isSelected(POSITION_TABS.EXPLORE)}
        ref={exploreRef}
        selector={setter(POSITION_TABS.EXPLORE)}
        text={t('Explore')}
      />
      <Grid
        sx={{
          background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
          borderRadius: '10px',
          height: '36px',
          left: `${indicatorStyle.left}px`,
          pointerEvents: 'none',
          position: 'absolute',
          top: '4px',
          transition: 'all ease-in-out 150ms',
          visibility: indicatorStyle.width ? 'visible' : 'hidden',
          width: indicatorStyle.width ? `${indicatorStyle.width}px` : 0,
          zIndex: 0
        }}
      />
    </Container>
  );
};

interface Props {
  dispatch: React.Dispatch<PositionsAction>;
  state: PositionsState;
  positionsCount: number | undefined;
  earningsCount: number | undefined;
}

function PositionsToolbar({ dispatch, earningsCount, positionsCount, state }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isTestnetEnabled = useIsTestnetEnabled();

  const positionOptions: AdvancedDropdownOption[] = useMemo(() => ([
    { Icon: <Profile color='#AA83DC' size='20' variant='Bulk' />, text: t('Solo Staking'), value: 'solo' },
    { Icon: <People color='#AA83DC' size='20' variant='Bulk' />, text: t('Pool Staking'), value: 'pool' },
    { Icon: <Category2 color='#AA83DC' size='20' variant='Bulk' />, text: t('Solo and Pool Staking'), value: 'both' }
  ]), [t]);

  useEffect(() => {
    isTestnetEnabled && dispatch({ type: 'TOGGLE_TESTNET' });
  }, [dispatch, isTestnetEnabled]);

  const setter = useCallback((selectedTab: POSITION_TABS) => () => dispatch({ payload: selectedTab, type: 'SET_TAB' }), [dispatch]);
  const stakingTypeHandler = useCallback((value: string | number) => dispatch({ payload: value as StakingType, type: 'SET_STAKING_TYPE' }), [dispatch]);
  const searchHandler = useCallback((text: string) => dispatch({ payload: text, type: 'SET_SEARCH_QUERY' }), [dispatch]);
  const toggleTestnets = useCallback(() => dispatch({ type: 'TOGGLE_TESTNET' }), [dispatch]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '40px', p: '14px', width: '100%' }}>
      <PositionsExplore
        earningsCount={earningsCount}
        positionsCount={positionsCount}
        selectedTab={state.tab}
        setter={setter}
      />
      {state.tab === POSITION_TABS.POSITIONS && (
        <DropSelect
          displayContentType='iconOption'
          onChange={stakingTypeHandler}
          options={positionOptions}
          style={{
            height: '44px',
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
            p: '5.5px 6px'
          },
          height: '44px',
          width: state.tab === POSITION_TABS.POSITIONS ? '195px' : '300px'
        }}
      />
      {isTestnetEnabled &&
        <MySwitch
          checked={state.isTestnet}
          columnGap='6px'
          label={t('Test Networks')}
          labelStyle={{ color: 'text.secondary', variant: 'B-4' }}
          onChange={toggleTestnets}
        />
      }
    </Container>
  );
}

export default memo(PositionsToolbar);
