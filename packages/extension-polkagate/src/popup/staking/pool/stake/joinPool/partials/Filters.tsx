// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';

import { BN } from '@polkadot/util';

import { Checkbox2, Input, Select, SlidePopUp, TwoButtons } from '../../../../../../components';
import { useTranslation } from '../../../../../../hooks';
import { DEFAULT_POOL_FILTERS } from '../../../../../../util/constants';
import { PoolFilter, PoolInfo, StakingConsts } from '../../../../../../util/types';
import { amountToMachine } from '../../../../../../util/utils';
import { getComparator } from './comparators';

interface Props {
  pools: PoolInfo[];
  show: boolean;
  setFilteredPools: (value: React.SetStateAction<PoolInfo[] | null | undefined>) => void;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  filters: PoolFilter;
  setFilters: React.Dispatch<React.SetStateAction<PoolFilter>>;
  setSortValue: React.Dispatch<React.SetStateAction<number | undefined>>;
  sortValue: number;
  apply: boolean;
  setApply: React.Dispatch<React.SetStateAction<boolean>>;
  token: string;
  decimal: number;
  stakingConsts: StakingConsts | null | undefined;
}

export default function Filters({ apply, decimal, filters, pools, setApply, setFilteredPools, setFilters, setShow, setSortValue, show, sortValue, stakingConsts, token }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const SORT_OPTIONS = useMemo(() => [
    { text: t('Index (Default)'), value: 0 },
    { text: t('Staked: High to Low'), value: 1 },
    { text: t('Staked: Low to High'), value: 2 },
    { text: t('Members: High to Low'), value: 3 },
    { text: t('Members: Low to High'), value: 4 },
    // { text: t('Commissions: High to Low'), value: 5 },
    // { text: t('Commissions: Low to High'), value: 6 }
  ], [t]);

  useEffect(() => {
    if (!apply || !pools) {
      return;
    }

    let filtered = pools;

    filtered = filters.stakedMoreThan.check
      ? filtered.filter((p) => p.bondedPool && filters.stakedMoreThan.value && p.bondedPool.points.gt(amountToMachine(String(filters.stakedMoreThan.value), decimal)))
      : filtered;
    filtered = filters.hasNominated.check
      ? filtered.filter((p) => p.stashIdAccount && filters.hasNominated.value && p.stashIdAccount.nominators.length > filters.hasNominated.value)
      : filtered;
    filtered = filters.membersMoreThan.check
      ? filtered.filter((p) => p.bondedPool && filters.membersMoreThan.value && new BN(p.bondedPool.memberCounter).gtn(filters.membersMoreThan.value))
      : filtered;

    // SORT
    filtered.sort(getComparator(filters.sortBy));

    setFilteredPools([...filtered]);
    setApply(false);
    setShow(false);
  }, [apply, decimal, filters, pools, setApply, setFilteredPools, setShow]);

  const onFilters = useCallback((filter: keyof PoolFilter | undefined, sortValue?: number) => {
    if (filter && !sortValue) {
      if (filter === 'stakedMoreThan') {
        filters.stakedMoreThan.check = !filters.stakedMoreThan.check;

        return setFilters({ ...filters });
      }

      if (filter === 'membersMoreThan') {
        filters.membersMoreThan.check = !filters.membersMoreThan.check;

        return setFilters({ ...filters });
      }

      if (filter === 'hasNominated') {
        filters.hasNominated.check = !filters.hasNominated.check;

        return setFilters({ ...filters });
      }

      filters[filter] = !filters[filter];
      setFilters({ ...filters });
    }

    if (sortValue) {
      filters.sortBy = SORT_OPTIONS.find((o) => o.value === sortValue)?.text ?? 'Index';

      return setFilters({ ...filters });
    }
  }, [SORT_OPTIONS, filters, setFilters]);

  const onLimitChange = useCallback((event: HTMLInputElement, type: 'membersMoreThan' | 'stakedMoreThan' | 'hasNominated') => {
    const value = parseInt(event.target.value);

    if (value) {
      filters[type].value = value;
      filters[type].check = true;

      setFilters({ ...filters });
    }
  }, [filters, setFilters]);

  const onApply = useCallback(() => {
    setApply(true);
  }, [setApply]);

  const onClear = useCallback(() => {
    console.log('DEFAULT_POOL_FILTERS:', DEFAULT_POOL_FILTERS)
    setFilters(structuredClone(DEFAULT_POOL_FILTERS) as PoolFilter);
    setSortValue(0);
    setApply(false);
  }, [setApply, setFilters, setSortValue]);

  const onCloseFilter = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const onSort = useCallback((value: string | number) => {
    onFilters(undefined, value);
    setSortValue(value);
  }, [onFilters, setSortValue]);

  const page = (
    <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item mt='46px' sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }} width='100%'>
      <Grid container justifyContent='center' my='20px'>
        <Typography fontSize='20px' fontWeight={400} lineHeight={1.4}>
          {t<string>('Filters')}
        </Typography>
      </Grid>
      <Grid alignItems='center' container justifyContent='center' >
        <Divider sx={{ bgcolor: 'secondary.main', width: '80%' }} />
        <Checkbox2
          checked={filters?.hasVerifiedIdentity}
          label={t<string>('Pool creator has verified identity')}
          onChange={() => onFilters('withIdentity')}
          style={{ fontSize: '14px', fontWeight: '300', mt: '15px', width: '80%' }}
        />
        <Checkbox2
          checked={filters?.hasNominated?.check}
          label={t<string>('Selected more than')}
          onChange={() => onFilters('hasNominated')}
          style={{ fontSize: '14px', fontWeight: '300', mt: '15px', width: '45%' }}
        />
        <Input
          autoCapitalize='off'
          autoCorrect='off'
          fontSize='18px'
          height='32px'
          margin='auto 0 0'
          max={100}
          onChange={(e) => onLimitChange(e, 'hasNominated')}
          padding='0px'
          placeholder={String(filters.hasNominated.value) || String(DEFAULT_POOL_FILTERS.hasNominated.value)}
          spellCheck={false}
          textAlign='center'
          theme={theme}
          type='number'
          width='8%'
        />
        <Typography ml='5px' pt='15px'>
          /{stakingConsts?.maxNominations || 16} {t('validators')}
        </Typography>
        <Checkbox2
          checked={filters?.stakedMoreThan?.check}
          label={t<string>('Staked more than')}
          onChange={() => onFilters('stakedMoreThan')}
          style={{ fontSize: '14px', fontWeight: '300', mt: '15px', width: '45%' }}
        />
        <Input
          autoCapitalize='off'
          autoCorrect='off'
          // disabled={!filters.maxCommission.check}
          fontSize='18px'
          height='32px'
          margin='auto 0 0'
          max={100}
          onChange={(e) => onLimitChange(e, 'stakedMoreThan')}
          padding='0px'
          placeholder={String(filters.stakedMoreThan.value) || String(DEFAULT_POOL_FILTERS.stakedMoreThan.value)}
          spellCheck={false}
          textAlign='center'
          theme={theme}
          type='number'
          width='20%'
        />
        <Typography ml='5px' pt='15px' width='14%'>
          {token}
        </Typography>
        <Checkbox2
          checked={filters?.membersMoreThan?.check}
          label={t<string>('Membersmore than')}
          onChange={() => onFilters('membersMoreThan')}
          style={{ fontSize: '14px', fontWeight: '300', mt: '15px', width: '45%' }}
        />
        <Input
          autoCapitalize='off'
          autoCorrect='off'
          fontSize='18px'
          height='32px'
          // margin='auto 0 0'
          margin='0 15% 0 0'
          max={100}
          onChange={(e) => onLimitChange(e, 'membersMoreThan')}
          padding='0px'
          placeholder={String(filters.membersMoreThan.value) || String(DEFAULT_POOL_FILTERS.membersMoreThan.value)}
          spellCheck={false}
          textAlign='center'
          theme={theme}
          type='number'
          width='20%'
        />
        <div style={{ paddingTop: '10px', width: '80%' }}>
          {(filters.sortBy || DEFAULT_POOL_FILTERS.sortBy) &&
            <Select
              label={t('Sort by')}
              onChange={onSort}
              options={SORT_OPTIONS}
              value={sortValue || SORT_OPTIONS[0].text}
            />
          }
        </div>
      </Grid>
      <TwoButtons
        onPrimaryClick={onApply}
        onSecondaryClick={onClear}
        primaryBtnText={t<string>('Apply')}
        secondaryBtnText={t<string>('Reset All')}
        variant='text'
      />
      <IconButton
        onClick={onCloseFilter}
        sx={{
          left: '15px',
          p: 0,
          position: 'absolute',
          top: '65px'
        }}
      >
        <CloseIcon sx={{ color: 'text.primary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );

  return (
    <SlidePopUp show={show}>
      {page}
    </SlidePopUp>
  );
}
