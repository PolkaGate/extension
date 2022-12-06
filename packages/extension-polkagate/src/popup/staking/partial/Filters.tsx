// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { Checkbox2, SlidePopUp } from '../../../components';
import { useTranslation } from '../../../hooks';
import { DEFAULT_VALIDATOR_COMMISSION_FILTER } from '../../../util/constants';
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

export default function Filters({ allValidatorsIdentities,order, setOrder,orderBy, setOrderBy, allValidatorsInfo, newSelectedValidators, setNewSelectedValidators, setShow, setValidatorsToList, show, stakingConsts }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [idOnly, setIdOnly] = useState<boolean>();
  const [noMoreThan20Comm, setNoMoreThan20Comm] = useState<boolean>();
  const [noOversubscribed, setNoOversubscribed] = useState<boolean>();
  const [noWaiting, setNoWaiting] = useState<boolean>();

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
          label={t<string>('Maximum Commission')}
          // onChange={() => setIdOnly(!idOnly)}
          style={{ width: '80%', fontSize: '14px', fontWeight: '300', pt: '15px' }}
        />
      </Grid>
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
