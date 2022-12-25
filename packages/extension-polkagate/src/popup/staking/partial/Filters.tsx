// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';

import { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { Checkbox2, Input, Select, SlidePopUp, TwoButtons } from '../../../components';
import { useTranslation } from '../../../hooks';
import { DEFAULT_FILTERS } from '../../../util/constants';
import { Filter, StakingConsts, ValidatorInfo, ValidatorInfoWithIdentity } from '../../../util/types';
import { getComparator } from './comparators';

interface Props {
  allValidatorsIdentities: DeriveAccountInfo[] | undefined;
  allValidators: ValidatorInfo[] | null | undefined;
  show: boolean;
  setNewSelectedValidators: React.Dispatch<React.SetStateAction<ValidatorInfo[]>>;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  stakingConsts: StakingConsts | null | undefined;
  setFilteredValidators: React.Dispatch<React.SetStateAction<ValidatorInfo[] | undefined>>;
  newSelectedValidators: ValidatorInfo[];
  filters: Filter;
  setFilters: React.Dispatch<React.SetStateAction<Filter>>;
  setSortValue: React.Dispatch<React.SetStateAction<number | undefined>>;
  sortValue: number;
  apply: boolean;
  setApply: React.Dispatch<React.SetStateAction<boolean>>;
  onLimitValidatorsPerOperator: (validators: ValidatorInfoWithIdentity[] | undefined, limit: number) => ValidatorInfoWithIdentity[];
}

export default function Filters({ allValidators, allValidatorsIdentities, apply, filters, newSelectedValidators, onLimitValidatorsPerOperator, setApply, setFilteredValidators, setFilters, setNewSelectedValidators, setShow, setSortValue, show, sortValue, stakingConsts }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const SORT_OPTIONS = useMemo(() => [
    { text: t('None (Default)'), value: 0 },
    { text: t('Staked: High to Low'), value: 1 },
    { text: t('Staked: Low to High'), value: 2 },
    { text: t('Commissions: High to Low'), value: 3 },
    { text: t('Commissions: Low to High'), value: 4 },
    { text: t('Nominators: High to Low'), value: 5 },
    { text: t('Nominators: Low to High'), value: 6 }
  ], [t]);


  useEffect(() => {
    if (!apply || !allValidators) {
      return;
    }

    // at first filtered blocked allValidators
    let filtered = allValidators?.filter((v) => !v.validatorPrefs.blocked);

    filtered = filters.noWaiting ? filtered?.filter((v) => v.exposure.others.length !== 0) : filtered;

    filtered = filters.noOversubscribed ? filtered?.filter((v) => v.exposure.others.length < stakingConsts?.maxNominatorRewardedPerValidator) : filtered;
    filtered = filters.maxCommission.check ? filtered?.filter((v) => Number(v.validatorPrefs.commission) / (10 ** 7) <= filters.maxCommission.value) : filtered;
    filtered = filters.limitOfValidatorsPerOperator.check && filters.limitOfValidatorsPerOperator.value ? onLimitValidatorsPerOperator(filtered, filters.limitOfValidatorsPerOperator.value) : filtered;

    if (filters.withIdentity && allValidatorsIdentities) {
      filtered = filtered?.filter((v) =>
        allValidatorsIdentities.find((i) => i.accountId === v.accountId && (i.identity.display || i.identity.displayParent) && i.identity?.judgements?.length));
    }

    // remove filtered validators from the selected list
    const selectedTemp = [...newSelectedValidators];

    newSelectedValidators?.forEach((s, index) => {
      if (!filtered.find((f) => f.accountId === s.accountId)) {
        selectedTemp.splice(index, 1);
      }
    });
    setNewSelectedValidators([...selectedTemp]);

    filters.sortBy !== 'None' && selectedTemp.sort(getComparator(filters.sortBy));
    filters.sortBy !== 'None' && filtered.sort(getComparator(filters.sortBy));

    setFilteredValidators([...selectedTemp.concat(filtered)]);
    setApply(false);
    setShow(false);
  }, [stakingConsts, filters, allValidatorsIdentities, onLimitValidatorsPerOperator, apply, allValidators, setNewSelectedValidators, setFilteredValidators, setShow, newSelectedValidators, setApply]);

  const onFilters = useCallback((filter: keyof Filter | undefined, sortValue?: number) => {
    if (filter && !sortValue) {
      if (filter === 'maxCommission') {
        filters.maxCommission.check = !filters.maxCommission.check;

        return setFilters({ ...filters });
      }

      if (filter === 'limitOfValidatorsPerOperator') {
        filters.limitOfValidatorsPerOperator.check = !filters.limitOfValidatorsPerOperator.check;

        return setFilters({ ...filters });
      }

      filters[filter] = !filters[filter];
      setFilters({ ...filters });
    }

    if (sortValue) {
      filters.sortBy = SORT_OPTIONS.find((o) => o.value === sortValue)?.text ?? 'None';

      return setFilters({ ...filters });
    }
  }, [SORT_OPTIONS, filters, setFilters]);

  const onLimitChange = useCallback((event: HTMLInputElement, type: 'maxCommission' | 'limitOfValidatorsPerOperator') => {
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
    console.log('DEFAULT_FILTERS:', DEFAULT_FILTERS)
    setFilters(structuredClone(DEFAULT_FILTERS) as Filter);
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
      <Grid container justifyContent='center' >
        <Divider sx={{ bgcolor: 'secondary.main', width: '80%' }} />
        <Checkbox2
          checked={filters?.withIdentity}
          label={t<string>('With verified identity')}
          onChange={() => onFilters('withIdentity')}
          style={{ fontSize: '14px', fontWeight: '300', mt: '15px', width: '80%' }}
        />
        <Checkbox2
          checked={filters?.noWaiting}
          label={t<string>('Not waiting (currently elected)')}
          onChange={() => onFilters('noWaiting')}
          style={{ fontSize: '14px', fontWeight: '300', mt: '15px', width: '80%' }}
        />
        <Checkbox2
          checked={filters?.noOversubscribed}
          label={t<string>('No oversubscribed')}
          onChange={() => onFilters('noOversubscribed')}
          style={{ fontSize: '14px', fontWeight: '300', mt: '15px', width: '80%' }}
        />
        <Checkbox2
          checked={filters?.noSlashed}
          disabled
          label={t<string>('No slashed before')}
          onChange={() => onFilters('noSlashed')}
          style={{ fontSize: '14px', fontWeight: '300', mt: '15px', width: '80%' }}
        />
        <Checkbox2
          checked={filters?.maxCommission?.check}
          label={`${t<string>('Maximum Commission')} %`}
          onChange={() => onFilters('maxCommission')}
          style={{ fontSize: '14px', fontWeight: '300', mt: '15px', width: '63%' }}
        />
        <Input
          autoCapitalize='off'
          autoCorrect='off'
          // disabled={!filters.maxCommission.check}
          fontSize='18px'
          height='32px'
          margin='auto 0 0'
          max={100}
          onChange={(e) => onLimitChange(e, 'maxCommission')}
          padding='0px'
          placeholder={String(filters.maxCommission.value) || String(DEFAULT_FILTERS.maxCommission.value)}
          spellCheck={false}
          textAlign='center'
          theme={theme}
          type='number'
          width='17%'
        />
        <Checkbox2
          checked={filters?.limitOfValidatorsPerOperator?.check}
          label={t<string>('Limit of validators per operator')}
          onChange={() => onFilters('limitOfValidatorsPerOperator')}
          style={{ fontSize: '14px', fontWeight: '300', mt: '15px', width: '63%' }}
        />
        <Input
          autoCapitalize='off'
          autoCorrect='off'
          // disabled={!filters.limitOfValidatorsPerOperator.check}
          fontSize='18px'
          height='32px'
          margin='auto 0 0'
          max={100}
          onChange={(e) => onLimitChange(e, 'limitOfValidatorsPerOperator')}
          padding='0px'
          placeholder={String(filters.limitOfValidatorsPerOperator.value) || String(DEFAULT_FILTERS.limitOfValidatorsPerOperator.value)}
          spellCheck={false}
          textAlign='center'
          theme={theme}
          type='number'
          width='17%'
        />
        <div style={{ paddingTop: '10px', width: '80%' }}>
          {(filters.sortBy || DEFAULT_FILTERS.sortBy) &&
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
