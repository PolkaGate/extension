// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-first-prop-new-line */

import '@vaadin/icons';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { InputFilter, Select } from '../../components';
import { useFormatted, useTranslation } from '../../hooks';
import { REFERENDA_STATUS } from './utils/consts';
import { LatestReferenda } from './utils/types';

interface Props {
  address: string;
  referendaToList: LatestReferenda[] | null | undefined;
  setFilteredReferenda: React.Dispatch<React.SetStateAction<LatestReferenda[] | null | undefined>>;
  setFilterState: React.Dispatch<React.SetStateAction<number>>;
  filterState: number;
}

export default function SearchBox({ address, filterState, referendaToList, setFilterState, setFilteredReferenda }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const formatted = useFormatted(address);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const statusOptions = useMemo(() => REFERENDA_STATUS.map((status, index) => {
    return {
      text: status[0],
      value: index
    };
  }), []);

  const onAdvanced = useCallback(() => {
    setShowAdvanced(true);
  }, []);

  const onMyReferenda = useCallback(() => {
    setFilterState(0);
    const list = referendaToList?.filter((ref) => ref.proposer === formatted);

    setFilteredReferenda(list);
  }, [formatted, referendaToList, setFilterState, setFilteredReferenda]);

  const onChangeStatus = useCallback((filterState: number) => {
    filterState = filterState == 'All' ? 0 : filterState;
    setFilterState(filterState);
    const list = referendaToList?.filter((ref) => REFERENDA_STATUS[filterState].includes(ref.status));

    setFilteredReferenda(list);
  }, [referendaToList, setFilterState, setFilteredReferenda]);

  return (
    <Grid alignItems='center' container pt='15px'>
      <Grid item justifyContent='flex-start' xs sx={{ ml: '5px' }}>
        <InputFilter
          autoFocus={false}
          // onChange={onSearch}
          placeholder={t<string>('🔍 Search in all referenda ')}
          theme={theme}
        // value={searchKeyword ?? ''}
        />
      </Grid>
      <Grid alignItems='center' container fontSize='16px' fontWeight={400} item justifyContent='flex-start' onClick={onAdvanced} pl='15px' py='10px' sx={{ cursor: 'pointer' }} xs={1.4}>
        {t('Advanced')}
        <Grid alignItems='center' container item justifyContent='center' sx={{ cursor: 'pointer', width: '25px' }}>
          <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 18, m: 'auto', stroke: '#BA2882', strokeWidth: '2px', transform: showAdvanced ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }} />
        </Grid>
      </Grid>
      <Grid alignItems='center' container fontSize='16px' fontWeight={400} item justifyContent='flex-start' py='10px' xs={2}>
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
      <Grid alignItems='center' container fontSize='16px' fontWeight={400} item justifyContent='flex-start' onClick={onMyReferenda} pl='15px' py='10px' sx={{ cursor: 'pointer', color: 'primary.main', textDecorationLine: 'underline', width: 'fit-content' }} >
        {t('My Referenda')}
      </Grid>
      <Grid alignItems='center' container fontSize='16px' fontWeight={400} item justifyContent='flex-start' onClick={onMyReferenda} pl='15px' py='10px' sx={{ cursor: 'pointer', color: 'primary.main', textDecorationLine: 'underline', width: 'fit-content' }} >
        {t('My Votes')}
      </Grid>
    </Grid>
  );
}