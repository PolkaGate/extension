// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Box, Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { Flash, People } from 'iconsax-react';
import React, { useCallback, useEffect } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { VerifiedTag } from '../../../assets/icons/index';
import { DecisionButtons, ExtensionPopup, GradientDivider } from '../../../components';
import MySwitch from '../../../components/MySwitch';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { useChainInfo, usePoolConst, useTranslation } from '../../../hooks';
import { amountToHuman, amountToMachine } from '../../../util';
import CheckBox from '../components/CheckBox';
import Search from '../components/Search';
import SortBy from './SortBy';

export enum SORTED_BY {
  INDEX = 'Index',
  NAME = 'Name',
  MOST_STAKED = 'Most Staked',
  LESS_STAKED = 'Less Staked',
  MOST_MEMBERS = 'Most Members',
  LESS_MEMBERS = 'Less Members',
  MOST_COMMISSION = 'Most Commission',
  LESS_COMMISSION = 'Less Commission'
}

export interface PoolFilterState {
  sortBy: string;
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

interface FilterItemProps {
  checked: boolean;
  TitleIcon: React.ReactNode;
  firstPartText: string;
  secondPartText: string;
  placeHolder: string;
  onChange: React.Dispatch<React.SetStateAction<Setting>>;
}

const FilterItem = ({ TitleIcon, checked, firstPartText, onChange, placeHolder, secondPartText }: FilterItemProps) => {
  const theme = useTheme();

  const handleCheckboxChange = useCallback(() => onChange((prev) => ({ ...prev, checked: !prev.checked })), [onChange]);
  const handleInputChange = useCallback((query: string) => {
    if (isNaN(Number(query)) || query === '') {
      onChange((prev) => ({ ...prev, threshold: '' }));

      return;
    }

    onChange((prev) => ({ ...prev, threshold: query }));
  }, [onChange]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '6px' }}>
      <CheckBox
        checked={checked}
        onChange={handleCheckboxChange}
      />
      {TitleIcon}
      <Typography color='text.highlight' variant='B-2'>
        {firstPartText}
      </Typography>
      <Search
        inputColor={theme.palette.text.highlight}
        limits={{ number: true }}
        noSearchIcon
        onSearch={handleInputChange}
        placeholder={placeHolder}
        style={{ width: '50px' }}
      />
      <Typography color='text.highlight' variant='B-2'>
        {secondPartText}
      </Typography>
    </Container>
  );
};

interface Setting {
  checked: boolean;
  threshold: string;
}

const init = {
  checked: false,
  threshold: ''
};

interface Props {
  dispatchFilter: React.Dispatch<PoolFilterAction>;
  openMenu: boolean;
  setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
  genesisHash: string | undefined;
  filter: PoolFilterState;
}

export default function PoolFilter ({ dispatchFilter, filter, genesisHash, openMenu, setOpenMenu }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const poolStakingConsts = usePoolConst(genesisHash);

  const [sortConfig, setSortConfig] = React.useState<string>(SORTED_BY.INDEX);
  const [justVerifiedStash, setJustVerifiedStash] = React.useState<boolean>(false);
  const [commissionSetting, setCommissionSetting] = React.useState<Setting>(init);
  const [stakedSetting, setStakedSetting] = React.useState<Setting>(init);
  const [membersSetting, setMembersSetting] = React.useState<Setting>(init);

  // Sync and initialize the local filter with the filter prop when it's already set
  useEffect(() => {
    filter.commissionThreshold !== undefined && setCommissionSetting({
      checked: true,
      threshold: filter.commissionThreshold.toString()
    });

    filter.isVerified && setJustVerifiedStash(filter.isVerified);

    filter.membersThreshold > 0 && setMembersSetting({
      checked: true,
      threshold: filter.membersThreshold.toString()
    });

    filter.stakedThreshold.gt(BN_ZERO) && setStakedSetting({
      checked: true,
      threshold: amountToHuman(filter.stakedThreshold, decimal, 2) ?? '0'
    });
  }, [decimal, filter.commissionThreshold, filter.isVerified, filter.membersThreshold, filter.stakedThreshold]);

  const toggleVerifiedStash = useCallback((_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setJustVerifiedStash(checked);
  }, []);

  const onApply = useCallback(() => {
    const commissionThreshold = commissionSetting.checked ? Number(commissionSetting.threshold) : undefined;
    const stakedThreshold = stakedSetting.checked ? amountToMachine(stakedSetting.threshold, decimal) : BN_ZERO;
    const membersThreshold = membersSetting.checked ? Number(membersSetting.threshold) : 1;

    dispatchFilter({
      payload: {
        commissionThreshold,
        isVerified: justVerifiedStash,
        membersThreshold,
        sortBy: sortConfig,
        stakedThreshold
      },
      type: 'UPDATE'
    });
    setOpenMenu(false);
  }, [commissionSetting.checked, commissionSetting.threshold, decimal, dispatchFilter, justVerifiedStash, membersSetting.checked, membersSetting.threshold, setOpenMenu, sortConfig, stakedSetting.checked, stakedSetting.threshold]);
  const onReset = useCallback(() => {
    dispatchFilter({ type: 'RESET' });
    setJustVerifiedStash(false);
    setSortConfig(SORTED_BY.INDEX);
    setCommissionSetting(init);
    setStakedSetting(init);
    setMembersSetting(init);
    setOpenMenu(false);
  }, [dispatchFilter, setOpenMenu]);
  const handleClose = useCallback(() => setOpenMenu(false), [setOpenMenu]);

  return (
    <ExtensionPopup
      darkBackground
      handleClose={handleClose}
      maxHeight='446px'
      openMenu={openMenu}
      title={t('Filters')}
      withoutTopBorder
    >
      <Stack direction='column' sx={{ height: '340px', position: 'relative', width: '100%' }}>
        <SortBy
          setSortBy={setSortConfig}
          sortBy={sortConfig}
          sortOptions={Object.values(SORTED_BY)}
        />
        <GradientDivider style={{ my: '14px' }} />
        <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '8px', justifyContent: 'space-between', m: 0, width: '96%' }}>
          <Box
            component='img'
            src={VerifiedTag as string}
            sx={{ height: '26px', width: '26px' }}
          />
          <Typography color='text.primary' sx={{ textAlign: 'left', width: 'calc(100% - 75px)' }} variant='B-2'>
            {t('Pool creator has verified identity')}
          </Typography>
          <MySwitch checked={justVerifiedStash} onChange={toggleVerifiedStash} />
        </Container>
        <GradientDivider style={{ my: '14px' }} />
        <FilterItem
          TitleIcon={<Flash color={theme.palette.text.highlight} size='26' variant='Bulk' />}
          checked={commissionSetting.checked}
          firstPartText={t('Commission less than')}
          onChange={setCommissionSetting}
          placeHolder={filter.commissionThreshold?.toString() ?? '100'}
          secondPartText={'%'}
        />
        <GradientDivider style={{ my: '14px' }} />
        <FilterItem
          TitleIcon={<SnowFlake color={theme.palette.text.highlight} size='18' />}
          checked={stakedSetting.checked}
          firstPartText={t('Staked more than')}
          onChange={setStakedSetting}
          placeHolder={
            filter.stakedThreshold.gt(BN_ZERO)
              ? amountToHuman(filter.stakedThreshold, decimal, 2)
              : amountToHuman(poolStakingConsts?.minCreationBond, decimal, 2) ?? '0'
          }
          secondPartText={token?.toUpperCase() ?? ''}
        />
        <GradientDivider style={{ my: '14px' }} />
        <FilterItem
          TitleIcon={<People color={theme.palette.text.highlight} size='22' variant='Bulk' />}
          checked={membersSetting.checked}
          firstPartText={t('Members more than')}
          onChange={setMembersSetting}
          placeHolder={filter.membersThreshold > 0 ? filter.membersThreshold.toString() : '1'}
          secondPartText={token?.toUpperCase() ?? ''}
        />
        <GradientDivider style={{ my: '14px' }} />
      </Stack>
      <Grid container item sx={{ mt: '60px' }}>
        <DecisionButtons
          direction='vertical'
          onPrimaryClick={onApply}
          onSecondaryClick={onReset}
          primaryBtnText={t('Apply')}
          secondaryBtnText={t('Reset all')}
          style={{
            height: '44px',
            width: '100%'
          }}
        />
      </Grid>
    </ExtensionPopup>
  );
}
