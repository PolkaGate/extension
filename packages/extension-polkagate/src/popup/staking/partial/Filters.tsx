// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { Checkbox2, Input, PButton, Select, SlidePopUp } from '../../../components';
import { useTranslation } from '../../../hooks';
import { DEFAULT_LIMIT_OF_VALIDATORS_PER_OPERATOR, DEFAULT_MAX_COMMISSION, DEFAULT_VALIDATOR_COMMISSION_FILTER } from '../../../util/constants';
import { AllValidators, StakingConsts, ValidatorInfo } from '../../../util/types';
import { Data, getComparator, Order } from './comparators';

interface Props {
  allValidatorsIdentities: DeriveAccountInfo[] | null | undefined;
  allValidatorsInfo: AllValidators | null | undefined;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  stakingConsts: StakingConsts | null | undefined;
  newSelectedValidators: ValidatorInfo[];
  setNewSelectedValidators: React.Dispatch<React.SetStateAction<ValidatorInfo[]>>;
  setValidatorsToList: (value: React.SetStateAction<ValidatorInfo[] | undefined>) => void;
  order: Order;
  setOrder: React.Dispatch<React.SetStateAction<Order>>;
  orderBy: keyof Data;
  setOrderBy: React.Dispatch<React.SetStateAction<keyof Data>>;
}

export default function Filters({ allValidatorsIdentities, order, setOrder, orderBy, setOrderBy, allValidatorsInfo, newSelectedValidators, setNewSelectedValidators, setShow, setValidatorsToList, show, stakingConsts }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const [idOnly, setIdOnly] = useState<boolean>();
  const [noMoreThan20Comm, setNoMoreThan20Comm] = useState<boolean>();
  const [noOversubscribed, setNoOversubscribed] = useState<boolean>();
  const [noWaiting, setNoWaiting] = useState<boolean>();

  const SORT_OPTIONS = [
    { text: t('None (Default)'), value: 1 },
    { text: t('Staked: Hight to Low'), value: 2 },
    { text: t('Staked: Low to High'), value: 3 },
    { text: t('Commissions: High to Low'), value: 4 },
    { text: t('Commissions: Low to High'), value: 5 },
    { text: t('Nominators: High to Low'), value: 6 },
    { text: t('Nominators: Low to High'), value: 7 }
  ];

  useEffect(() => {
    if (!allValidatorsInfo || !allValidatorsIdentities) {
      return;
    }

    let filteredValidators = allValidatorsInfo.current.concat(allValidatorsInfo.waiting);

    // at first filtered blocked allValidatorsInfo
    filteredValidators = filteredValidators?.filter((v) => !v.validatorPrefs.blocked);

    filteredValidators = noWaiting ? filteredValidators?.filter((v) => v.exposure.others.length !== 0) : filteredValidators;
    filteredValidators = noOversubscribed ? filteredValidators?.filter((v) => v.exposure.others.length < stakingConsts?.maxNominatorRewardedPerValidator) : filteredValidators;
    filteredValidators = noMoreThan20Comm ? filteredValidators?.filter((v) => Number(v.validatorPrefs.commission) / (10 ** 7) <= DEFAULT_VALIDATOR_COMMISSION_FILTER) : filteredValidators;

    if (idOnly && allValidatorsIdentities) {
      filteredValidators = filteredValidators?.filter((v) =>
        allValidatorsIdentities.find((i) => i.accountId === v.accountId && (i.identity.display || i.identity.displayParent)));
    }

    // remove filtered validators from the selected list
    const selectedTemp = [...newSelectedValidators];

    newSelectedValidators?.forEach((s, index) => {
      if (!filteredValidators.find((f) => f.accountId === s.accountId)) {
        selectedTemp.splice(index, 1);
      }
    });
    setNewSelectedValidators([...selectedTemp]);

    selectedTemp.sort(getComparator(order, orderBy));
    filteredValidators.sort(getComparator(order, orderBy));

    setValidatorsToList(selectedTemp.concat(filteredValidators));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stakingConsts, allValidatorsInfo, allValidatorsIdentities, noWaiting, noOversubscribed, noMoreThan20Comm, idOnly, order, orderBy]);

  const handleRequestSort = (_event: React.MouseEvent<unknown>, property: keyof Data) => {
    const isAsc = orderBy === property && order === 'asc';

    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const closeMenu = useCallback(
    () => setShow(false),
    [setShow]
  );

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
          // checked={idOnly}
          label={t<string>('With verified identity')}
          // onChange={() => setIdOnly(!idOnly)}
          style={{ width: '80%', fontSize: '14px', fontWeight: '400', pt: '15px' }}
        />
        <Checkbox2
          // checked={idOnly}
          label={t<string>('Not waiting (currently elected)')}
          // onChange={() => setIdOnly(!idOnly)}
          style={{ width: '80%', fontSize: '14px', fontWeight: '30', pt: '15px' }}
        />
        <Checkbox2
          // checked={idOnly}
          label={t<string>('No oversubscribed')}
          // onChange={() => setIdOnly(!idOnly)}
          style={{ width: '80%', fontSize: '14px', fontWeight: '300', pt: '15px' }}
        />
        <Checkbox2
          // checked={idOnly}
          label={t<string>('No slashed before')}
          // onChange={() => setIdOnly(!idOnly)}
          style={{ width: '80%', fontSize: '14px', fontWeight: '300', pt: '15px' }}
        />
        <Checkbox2
          // checked={idOnly}
          label={`${t<string>('Maximum Commission')}%`}
          // onChange={() => setIdOnly(!idOnly)}
          style={{ width: '63%', fontSize: '14px', fontWeight: '300', pt: '15px' }}
        />
        <Input
          autoCapitalize='off'
          autoCorrect='off'
          padding='0px'
          spellCheck={false}
          textAlign='center'
          type='text'
          placeholder={DEFAULT_MAX_COMMISSION}
          // value={DEFAULT_MAX_COMMISSION}
          width='17%'
          theme={theme}
          // onChange={onChangeFilter}
          fontSize='18px'
          margin='auto 0 0'
          height='36px'
        />
        <Checkbox2
          // checked={idOnly}
          label={t<string>('Limit of validators per operator')}
          // onChange={() => setIdOnly(!idOnly)}
          style={{ width: '63%', fontSize: '14px', fontWeight: '300', pt: '15px' }}
        />
        <Input
          autoCapitalize='off'
          autoCorrect='off'
          padding='0px'
          spellCheck={false}
          textAlign='center'
          type='text'
          placeholder={DEFAULT_LIMIT_OF_VALIDATORS_PER_OPERATOR}
          // value={DEFAULT_MAX_COMMISSION}
          width='17%'
          theme={theme}
          // onChange={onChangeFilter}
          fontSize='18px'
          height='36px'
          margin='auto 0 0'
        />
        <div style={{ width: '80%', paddingTop: '10px' }}>
          <Select
            label={'Sort by'}
            // onChange={_onChangeEndpoint}
            options={SORT_OPTIONS}
            value={t('None (Default)')}
          />
        </div>
      </Grid>
      <PButton
        // _onClick={apply}
        text={t<string>('Apply')}
      />
      <IconButton
        onClick={closeMenu}
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
