// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-first-prop-new-line */

import '@vaadin/icons';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState, useEffect } from 'react';

import { Checkbox2, InputFilter, Select } from '../../components';
import { useFormatted, useTranslation } from '../../hooks';
import { REFERENDA_STATUS } from './utils/consts';
import { LatestReferenda } from './utils/types';

interface Props {
  address: string;
  referendaToList: LatestReferenda[] | null | undefined;
  setFilteredReferenda: React.Dispatch<React.SetStateAction<LatestReferenda[] | null | undefined>>;
  setFilterState: React.Dispatch<React.SetStateAction<number>>;
  filterState: number;
  myVotedReferendaIndexes: number[] | null | undefined;
}

export default function SearchBox({ address, filterState, myVotedReferendaIndexes, referendaToList, setFilterState, setFilteredReferenda }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const formatted = useFormatted(address);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showMyReferenda, setShowMyReferenda] = useState<boolean>(false);
  const [showMyVoted, setShowMyVoted] = useState<boolean>(false);

  const statusOptions = useMemo(() => REFERENDA_STATUS.map((status, index) => {
    return {
      text: status[0],
      value: index
    };
  }), []);

  const onAdvanced = useCallback(() => {
    setShowAdvanced(true);
  }, []);

  const onMyVotes = useCallback(() => {
    setFilterState(0);
    setShowMyVoted((prev) => !prev);
  }, [setFilterState]);

  const onMyReferenda = useCallback(() => {
    setFilterState(0);
    setShowMyReferenda((prev) => !prev);
  }, [setFilterState]);

  useEffect(() => {
    const filtered = [];

    if (showMyReferenda) {
      const mySubmittedReferendaList = referendaToList?.filter((ref) => ref.proposer === formatted);

      mySubmittedReferendaList && filtered.push(...mySubmittedReferendaList);
    }

    if (showMyVoted) {
      const myVotedList = referendaToList?.filter((ref) => myVotedReferendaIndexes?.includes(ref.post_id));

      myVotedList && filtered.push(...myVotedList);
    }

    setFilteredReferenda((showMyReferenda || showMyVoted) ? filtered : referendaToList);
  }, [formatted, myVotedReferendaIndexes, referendaToList, setFilteredReferenda, showMyReferenda, showMyVoted]);

  const onChangeStatus = useCallback((filterState: number) => {
    filterState = filterState == 'All' ? 0 : filterState;
    setFilterState(filterState);
    const list = referendaToList?.filter((ref) => REFERENDA_STATUS[filterState].includes(ref.status));

    setFilteredReferenda(list);
  }, [referendaToList, setFilterState, setFilteredReferenda]);

  return (
    <Grid alignItems='center' container justifyContent='space-between' pt='15px'>
      <Grid item justifyContent='flex-start' sx={{ ml: '5px' }} md={6}>
        <InputFilter
          autoFocus={false}
          // onChange={onSearch}
          placeholder={t<string>('🔍 Search in all referenda ')}
          theme={theme}
        // value={searchKeyword ?? ''}
        />
      </Grid>
      <Grid alignItems='center' container fontSize='16px' fontWeight={400} item justifyContent='flex-start' onClick={onAdvanced} py='10px' sx={{ cursor: 'pointer' }} width='fit-content'>
        {t('Advanced')}
        <Grid alignItems='center' container item justifyContent='center' sx={{ cursor: 'pointer', width: '25px' }}>
          <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 18, m: 'auto', stroke: '#BA2882', strokeWidth: '2px', transform: showAdvanced ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }} />
        </Grid>
      </Grid>
      <Grid alignItems='center' container fontSize='16px' fontWeight={400} item justifyContent='flex-start' py='10px' width='fit-content'>
        {t('Status')}
        <Grid alignItems='center' container item justifyContent='center' pl='10px' sx={{ width: '130px' }}>
          {statusOptions &&
            <Select
              // _mt='15px'
              defaultValue={0}
              // label={t<string>('Status')}
              onChange={onChangeStatus}
              options={statusOptions}
              value={filterState}
            />
          }
        </Grid>
      </Grid>
      <Grid alignItems='center' container item justifyContent='flex-start' py='10px' sx={{ cursor: 'pointer', color: 'primary.main', textDecorationLine: 'underline', width: 'fit-content' }} >
        <Checkbox2
          checked={showMyReferenda}
          label={t('My Referenda')}
          labelStyle={{ fontSize: '16px', fontWeight: '400' }}
          onChange={onMyReferenda}
        />
      </Grid>
      <Grid alignItems='center' container item justifyContent='flex-start' py='10px' sx={{ cursor: 'pointer', color: 'primary.main', textDecorationLine: 'underline', width: 'fit-content' }} >
        <Checkbox2
          checked={showMyVoted}
          label={t('My Votes')}
          labelStyle={{ fontSize: '16px', fontWeight: '400' }}
          onChange={onMyVotes}
        />
      </Grid>
    </Grid>
  );
}