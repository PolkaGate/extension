// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Stack, Typography, useTheme } from '@mui/material';
import { Flash, People } from 'iconsax-react';
import React, { useCallback } from 'react';

import { type BN, BN_ZERO, noop } from '@polkadot/util';

import { DecisionButtons, ExtensionPopup, GradientDivider } from '../../../components';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { useChainInfo, useTranslation } from '../../../hooks';
import CheckBox from '../components/CheckBox';
import Search from '../components/Search';

enum SORTED_BY {
  INDEX,
  NAME,
  MOST_STAKED,
  LESS_STAKED,
  MOST_MEMBERS,
  LESS_MEMBERS,
  MOST_COMMISSION,
  LESS_COMMISSION
}

export interface PoolFilterState {
  sortBy: SORTED_BY;
  isVerified: boolean;
  commissionThreshold: number | undefined;
  stakedThreshold: BN;
  membersThreshold: number;
}

export type PoolFilterAction =
  | { type: 'RESET' }
  | { type: 'UPDATE'; payload: Partial<PoolFilterState> };

export const INITIAL_POOL_FILTER_STATE: PoolFilterState = {
  commissionThreshold: undefined,
  isVerified: false,
  membersThreshold: 0,
  sortBy: SORTED_BY.INDEX,
  stakedThreshold: BN_ZERO
};

export const poolFilterReducer = (state: PoolFilterState, action: PoolFilterAction): PoolFilterState => {
  switch (action.type) {
    case 'RESET':
      return INITIAL_POOL_FILTER_STATE;
    case 'UPDATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

// const SortBy = () => {
//   return ();
// };

interface FilterItemProps {
  checked: boolean;
  TitleIcon: React.ReactNode;
  firstPartText: string;
  secondPartText: string;
}

const FilterItem = ({ TitleIcon, checked, firstPartText, secondPartText }: FilterItemProps) => {
  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '6px' }}>
      <CheckBox
        checked={checked}
        onChange={noop}
      />
      {TitleIcon}
      <Typography color='text.highlight' variant='B-2'>
        {firstPartText}
      </Typography>
      <Search limits={{ number: true }} noSearchIcon onSearch={noop} placeholder='' style={{ width: '50px' }} />
      <Typography color='text.highlight' variant='B-2'>
        {secondPartText}
      </Typography>
    </Container>
  );
};

interface Props {
  dispatchFilter: React.Dispatch<PoolFilterAction>;
  openMenu: boolean;
  setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
  genesisHash: string | undefined;
}

export default function PoolFilter ({ dispatchFilter, genesisHash, openMenu, setOpenMenu }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { token } = useChainInfo(genesisHash, true);

  const handleClose = useCallback(() => setOpenMenu(false), [setOpenMenu]);

  return (
    <ExtensionPopup
      handleClose={handleClose}
      maxHeight='446px'
      openMenu={openMenu}
      title={t('Filters')}
      withoutBackground
      withoutTopBorder
    >
      <Stack direction='column' sx={{ height: '340px', position: 'relative', width: '100%' }}>
        <FilterItem
          TitleIcon={<Flash color={theme.palette.text.highlight} size='26' variant='Bulk' />}
          checked
          firstPartText={t('Selected more than')}
          secondPartText={t('/ {{max}} validators', { replace: { max: 16 } })}
        />
        <GradientDivider style={{ my: '14px' }} />
        <FilterItem
          TitleIcon={<SnowFlake color={theme.palette.text.highlight} size='18' />}
          checked
          firstPartText={t('Staked more than')}
          secondPartText={token?.toUpperCase() ?? ''}
        />
        <GradientDivider style={{ my: '14px' }} />
        <FilterItem
          TitleIcon={<People color={theme.palette.text.highlight} size='22' variant='Bulk' />}
          checked
          firstPartText={t('Members more than')}
          secondPartText={token?.toUpperCase() ?? ''}
        />
        <GradientDivider style={{ my: '14px' }} />
      </Stack>
      <DecisionButtons
        direction='vertical'
        onPrimaryClick={noop}
        onSecondaryClick={noop}
        primaryBtnText={t('Apply')}
        secondaryBtnText={t('Reset all')}
        style={{
          height: '106px',
          width: '100%'
        }}
      />
    </ExtensionPopup>
  );
}
