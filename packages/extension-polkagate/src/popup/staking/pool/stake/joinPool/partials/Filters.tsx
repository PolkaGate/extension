// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
//@ts-nocheck

import type { PoolFilter, PoolInfo, StakingConsts } from '@polkadot/extension-polkagate/src/util/types';

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';

import { Checkbox2, Input, Select, SlidePopUp, TwoButtons } from '@polkadot/extension-polkagate/src/components';
import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import { useIsExtensionPopup, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { getComparator } from '@polkadot/extension-polkagate/src/popup/staking/pool/stake/joinPool/partials/comparators';
import { DEFAULT_POOL_FILTERS } from '@polkadot/extension-polkagate/src/util/constants';
import { amountToMachine } from '@polkadot/extension-polkagate/src/util/utils';
import { BN } from '@polkadot/util';

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
  const isExtensionPopup = useIsExtensionPopup();

  const SORT_OPTIONS = useMemo(() => [
    { text: t('Index (Default)'), value: 0 },
    { text: t('Staked: High to Low'), value: 1 },
    { text: t('Staked: Low to High'), value: 2 },
    { text: t('Members: High to Low'), value: 3 },
    { text: t('Members: Low to High'), value: 4 },
    { text: t('Commissions: High to Low'), value: 5 },
    { text: t('Commissions: Low to High'), value: 6 }
  ], [t]);

  useEffect(() => {
    if (!apply || !pools) {
      return;
    }

    let filtered = pools;

    filtered = filters.hasVerifiedIdentity
      ? filtered?.filter((p) => !!p?.identity?.judgements?.length)
      : filtered;
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
    <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item mt={isExtensionPopup ? '46px' : 0} sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }} width='100%'>
      <Grid container justifyContent='center' my='20px'>
        <Typography fontSize='20px' fontWeight={400} lineHeight={1.4}>
          {t('Filters')}
        </Typography>
      </Grid>
      <Grid alignItems='center' container justifyContent='center'>
        <Divider sx={{ bgcolor: 'secondary.light', width: '80%' }} />
        <Grid alignItems='center' container item m='3px 34px 3px'>
          <Checkbox2
            checked={filters?.hasVerifiedIdentity}
            label={t('Pool creator has verified identity')}
            onChange={() => onFilters('hasVerifiedIdentity')}
            style={{ fontSize: '14px', fontWeight: '300', mt: '15px', width: '80%' }}
          />
        </Grid>
        <Grid alignItems='center' container item m='3px 34px 3px'>
          <Checkbox2
            checked={filters?.hasNominated?.check}
            label={t('Selected more than')}
            onChange={() => onFilters('hasNominated')}
            style={{ fontSize: '14px', fontWeight: '300', width: '56%' }}
          />
          <Input
            autoCapitalize='off'
            autoCorrect='off'
            fontSize='18px'
            max={100}
            onChange={(e) => onLimitChange(e, 'hasNominated')}
            padding='0px'
            placeholder={String(filters.hasNominated.value) || String(DEFAULT_POOL_FILTERS.hasNominated.value)}
            spellCheck={false}
            textAlign='center'
            theme={theme}
            type='number'
            width='10%'
          />
          <Typography fontWeight={300} ml='5px'>
            /{stakingConsts?.maxNominations || 16} {t('validators')}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item m='3px 34px 3px'>
          <Checkbox2
            checked={filters?.stakedMoreThan?.check}
            label={t('Staked more than')}
            onChange={() => onFilters('stakedMoreThan')}
            style={{ fontSize: '14px', fontWeight: '300', width: '56%' }}
          />
          <Input
            autoCapitalize='off'
            autoCorrect='off'
            fontSize='18px'
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
          <Typography fontWeight={300} ml='5px' width='14%'>
            {token}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item m='3px 34px 3px'>
          <Checkbox2
            checked={filters?.membersMoreThan?.check}
            label={t('Members more than')}
            onChange={() => onFilters('membersMoreThan')}
            style={{ fontSize: '14px', fontWeight: '300', width: '56%' }}
          />
          <Input
            autoCapitalize='off'
            autoCorrect='off'
            fontSize='18px'
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
        </Grid>
        <div style={{ paddingTop: '10px', width: isExtensionPopup ? '80%' : '85%' }}>
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
        ml={isExtensionPopup ? undefined : '0'}
        onPrimaryClick={onApply}
        onSecondaryClick={onClear}
        primaryBtnText={t('Apply')}
        secondaryBtnText={t('Reset All')}
        variant='text'
      />
      <IconButton
        onClick={onCloseFilter}
        sx={{
          left: isExtensionPopup ? '15px' : undefined,
          p: 0,
          position: 'absolute',
          right: isExtensionPopup ? undefined : '30px',
          top: isExtensionPopup ? '65px' : '35px'
        }}
      >
        <CloseIcon sx={{ color: 'text.primary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );

  return (
    <>
      {isExtensionPopup
        ? <SlidePopUp show={show}>
          {page}
        </SlidePopUp>
        : <DraggableModal minHeight={650} onClose={onCloseFilter} open={show} px={0}>
          {page}
        </DraggableModal>
      }
    </>
  );
}
