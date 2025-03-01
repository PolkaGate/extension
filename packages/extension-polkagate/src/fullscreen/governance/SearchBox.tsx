// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-first-prop-new-line */

import type { LatestReferenda } from './utils/types';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Collapse, Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Checkbox2, InputFilter, Select } from '../../components';
import { useFormatted, useTranslation } from '../../hooks';
import { REFERENDA_STATUS } from './utils/consts';

interface Props {
  address: string;
  referenda: LatestReferenda[] | null | undefined;
  setFilteredReferenda: React.Dispatch<React.SetStateAction<LatestReferenda[] | null | undefined>>;
  myVotedReferendaIndexes: number[] | null | undefined;
}

interface Filter {
  advanced: {
    refIndex?: boolean;
    titles?: boolean;
    proposers?: boolean;
    methods?: boolean;
  }
  myReferenda: boolean;
  myVotes: boolean;
  status: string;
}

const DEFAULT_FILTER = {
  advanced: {
    methods: true, proposers: true, refIndex: true, titles: true
  },
  myReferenda: false,
  myVotes: false,
  status: REFERENDA_STATUS[0]
};

export default function SearchBox({ address, myVotedReferendaIndexes, referenda, setFilteredReferenda }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const formatted = useFormatted(address);

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [filter, setFilter] = useState<Filter>(JSON.parse(JSON.stringify(DEFAULT_FILTER)) as Filter);
  const [searchKeyword, setSearchKeyword] = useState<string>();

  const statusOptions = useMemo(() => REFERENDA_STATUS.map((status, index) => {
    return {
      text: status[0],
      value: index
    };
  }), []);

  const applySearchFilter = useCallback((referendaToFilter: LatestReferenda[], keyword: string) => {
    const filtered = referendaToFilter.filter((r) =>
      (filter.advanced.refIndex && String(r.post_id) === keyword) ||
      (filter.advanced.titles && r.title && r.title.toLowerCase().includes(keyword.toLowerCase())) ||
      (filter.advanced.methods && r.method && r.method.toLowerCase().includes(keyword.toLowerCase())) ||
      (filter.advanced.proposers && r.proposer === keyword)
    );

    return filtered;
  }, [filter.advanced.methods, filter.advanced.proposers, filter.advanced.refIndex, filter.advanced.titles]);

  const onAdvanced = useCallback(() => {
    setShowAdvanced(!showAdvanced);
  }, [showAdvanced]);

  const onMyVotes = useCallback(() => {
    filter.myVotes = !filter.myVotes;
    setFilter({ ...filter });
  }, [filter]);

  const onFilter = useCallback((key: string) => {
    filter.advanced[key] = !filter.advanced[key];
    setFilter({ ...filter });
  }, [filter]);

  const onReset = useCallback(() => {
    setFilter(JSON.parse(JSON.stringify(DEFAULT_FILTER)) as Filter);
  }, []);

  const onSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
  }, []);

  const onMyReferenda = useCallback(() => {
    filter.myReferenda = !filter.myReferenda;
    setFilter({ ...filter });
  }, [filter]);

  useEffect(() => {
    if (referenda === undefined) {
      return;
    }

    if (referenda === null) {
      return setFilteredReferenda(null);
    }

    /**  To apply filtering ... */
    let filtered = [...referenda];

    if (filter.myReferenda) {
      filtered = filtered.filter((r) => r.proposer === formatted);
    }

    if (filter.myVotes) {
      filtered = filtered.filter((r) => myVotedReferendaIndexes?.includes(r.post_id));
    }

    if (!filter.status.includes('All')) {
      filtered = filtered.filter((r) => filter.status.includes(r.status));
    }

    if (searchKeyword) {
      filtered = applySearchFilter(filtered, searchKeyword);
    }

    // to remove duplicates
    const uniqueFiltered = [...new Set(filtered)];

    const isAnyFilterOn = filter.myReferenda || filter.myVotes || !filter.status.includes('All') || searchKeyword;

    setFilteredReferenda(isAnyFilterOn ? uniqueFiltered : referenda);
  }, [applySearchFilter, filter, formatted, myVotedReferendaIndexes, referenda, searchKeyword, setFilteredReferenda]);

  const onChangeStatus = useCallback((s: number) => {
    s = String(s) === 'All' ? 0 : s;
    const list = referenda?.filter((ref) => REFERENDA_STATUS[s].includes(ref.status));

    setFilteredReferenda(list);

    filter.status = String(s) === 'All' ? s : REFERENDA_STATUS[s];
    setFilter({ ...filter });
  }, [filter, referenda, setFilteredReferenda]);

  return (
    <>
      <Grid alignItems='center' container justifyContent='space-between' pt='15px' px='5px'>
        <Grid item justifyContent='flex-start' md={6}>
          <InputFilter
            autoFocus={false}
            onChange={onSearch}
            placeholder={t('🔍 Search in all referenda ')}
            theme={theme}
          // value={searchKeyword ?? ''}
          />
        </Grid>
        <Grid alignItems='center' container fontSize='16px' fontWeight={400} item justifyContent='flex-start' onClick={onAdvanced} py='10px' sx={{ cursor: 'pointer' }} width='fit-content'>
          {t('Advanced')}
          <Grid alignItems='center' container item justifyContent='center' sx={{ cursor: 'pointer', width: '25px' }}>
            <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 18, m: 'auto', stroke: theme.palette.secondary.light, strokeWidth: '2px', transform: showAdvanced ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }} />
          </Grid>
        </Grid>
        <Grid alignItems='center' container fontSize='16px' fontWeight={400} item justifyContent='flex-start' py='10px' width='fit-content'>
          {t('Status')}
          <Grid alignItems='center' container item justifyContent='center' pl='10px' sx={{ width: '130px' }}>
            {statusOptions &&
              <Select
                defaultValue={'All'}
                onChange={onChangeStatus}
                options={statusOptions}
              />
            }
          </Grid>
        </Grid>
        <Grid alignItems='center' container item justifyContent='flex-start' py='10px' sx={{ color: theme.palette.mode === 'light' ? 'secondary.main' : 'text.primary', cursor: 'pointer', textDecorationLine: 'underline', width: 'fit-content' }}>
          <Checkbox2
            checked={filter.myReferenda}
            disabled={!referenda}
            label={t('My Referenda')}
            labelStyle={{ fontSize: '16px', fontWeight: 400 }}
            onChange={onMyReferenda}
          />
        </Grid>
        <Grid alignItems='center' container item justifyContent='flex-start' py='10px' sx={{ color: theme.palette.mode === 'light' ? 'secondary.main' : 'text.primary', cursor: 'pointer', textDecorationLine: 'underline', width: 'fit-content' }}>
          <Checkbox2
            checked={filter.myVotes}
            disabled={!myVotedReferendaIndexes}
            label={t('My Votes')}
            labelStyle={{ fontSize: '16px', fontWeight: 400 }}
            onChange={onMyVotes}
          />
        </Grid>
      </Grid>
      <Collapse in={showAdvanced} sx={{ width: '100%' }}>
        <Grid alignItems='center' container justifyContent='flex-start' sx={{ bgcolor: 'background.paper', borderRadius: '5px', fontSize: '16px', fontWeight: '400', height: '52px', pl: '22px', width: '90%' }}>
          <Grid item>
            {t('Search in:')}
          </Grid>
          <Grid item ml='22px'>
            <Checkbox2
              checked={filter.advanced.refIndex}
              label={t('Ref. Index')}
              labelStyle={{ fontSize: '16px', fontWeight: 400 }}
              onChange={() => onFilter('refIndex')}
            />
          </Grid>
          <Grid item ml='22px'>
            <Checkbox2
              checked={filter.advanced.titles}
              label={t('Titles')}
              labelStyle={{ fontSize: '16px', fontWeight: 400 }}
              onChange={() => onFilter('titles')}
            />
          </Grid>
          <Grid item ml='22px'>
            <Checkbox2
              checked={filter.advanced.proposers}
              label={t('Proposers')}
              labelStyle={{ fontSize: '16px', fontWeight: 400 }}
              onChange={() => onFilter('proposers')}
            />
          </Grid>
          <Grid item ml='22px'>
            <Checkbox2
              checked={filter.advanced.methods}
              label={t('Methods')}
              labelStyle={{ fontSize: '16px', fontWeight: 400 }}
              onChange={() => onFilter('methods')}
            />
          </Grid>
          <Grid item onClick={onReset} sx={{ color: 'secondary.light', cursor: 'pointer', ml: '22px', textDecorationLine: 'underline' }}>
            {t('Reset')}
          </Grid>
        </Grid>
      </Collapse>
    </>
  );
}
