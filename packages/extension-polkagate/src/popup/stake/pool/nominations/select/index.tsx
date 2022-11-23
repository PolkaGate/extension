// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens unstake review page
 * */

import type { AccountId } from '@polkadot/types/interfaces';

import SearchIcon from '@mui/icons-material/Search';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';

import { Checkbox, Motion, PButton, Popup } from '../../../../../components';
import { useTranslation } from '../../../../../hooks';
import { HeaderBrand } from '../../../../../partials';
import { DEFAULT_VALIDATOR_COMMISSION_FILTER } from '../../../../../util/constants';
import { AllValidators, MyPoolInfo, StakingConsts, ValidatorInfo } from '../../../../../util/types';
import ValidatorsTable from '../partials/ValidatorsTable';

interface Props {
  address: string;
  allValidatorsIdentities: DeriveAccountInfo[] | null | undefined
  api: ApiPromise;
  chain: Chain | null;
  formatted: string;
  title: string;
  poolId: BN | undefined;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  allValidatorsInfo: AllValidators | null | undefined
  selectedValidatorsId: AccountId[] | null | undefined
  stakingConsts: StakingConsts | undefined
  pool: MyPoolInfo | undefined;
}

interface Data {
  name: string;
  commission: number;
  nominator: number;
  staked: string;
}

type Order = 'asc' | 'desc';

function descendingComparator<T>(a: ValidatorInfo, b: ValidatorInfo, orderBy: keyof T) {
  let A, B;

  switch (orderBy) {
    case ('commission'):
      A = a.validatorPrefs.commission;
      B = b.validatorPrefs.commission;
      break;
    case ('nominator'):
      A = a.exposure.others.length;
      B = b.exposure.others.length;
      break;
    default:
      A = a.accountId;
      B = b.accountId;
  }

  if (B < A) {
    return -1;
  }

  if (B > A) {
    return 1;
  }

  return 0;
}

function getComparator<T>(order: Order, orderBy: keyof T): (a: ValidatorInfo, b: ValidatorInfo) => number {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function SelectValidators({ address, allValidatorsIdentities, allValidatorsInfo, api, chain, formatted, pool, poolId, selectedValidatorsId, setShow, show, stakingConsts, title }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const [idOnly, setIdOnly] = useState<boolean>();
  const [noMoreThan20Comm, setNoMoreThan20Comm] = useState<boolean>();
  const [noOversubscribed, setNoOversubscribed] = useState<boolean>();
  const [noWaiting, setNoWaiting] = useState<boolean>();
  const [validatorsToList, setValidatorsToList] = useState<ValidatorInfo[]>();
  const [newSelectedValidators, setNewSelectedValidators] = useState<ValidatorInfo[]>([]);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Data>('name');

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

  const _onBackClick = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const handleRequestSort = (_event: React.MouseEvent<unknown>, property: keyof Data) => {
    const isAsc = orderBy === property && order === 'asc';

    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const isSelected = useCallback((v: ValidatorInfo) => newSelectedValidators.indexOf(v) !== -1, [newSelectedValidators]);

  const handleCheck = useCallback((checked: boolean, validator: ValidatorInfo) => {
    if (newSelectedValidators.length >= stakingConsts?.maxNominations && checked) {
      console.log('Max validators are selected !');

      return;
    }

    const newSelected: ValidatorInfo[] = [...newSelectedValidators];

    if (checked) {
      newSelected.push(validator);
    } else {
      /** remove unchecked from the selection */
      const selectedIndex = newSelectedValidators.indexOf(validator);

      newSelected.splice(selectedIndex, 1);
    }

    setNewSelectedValidators([...newSelected]);
  }, [newSelectedValidators, stakingConsts?.maxNominations]);

  const Filters = () => (
    <Grid container fontSize='14px' fontWeight='400' item pb='15px'>
      <Checkbox
        label={t<string>('ID only')}
        onChange={() => setIdOnly(!idOnly)}
        style={{ pb: '5px', width: '30%' }}
        theme={theme}
      />
      <Checkbox
        label={t<string>('No more than 20 Commission')}
        onChange={() => setNoMoreThan20Comm(!noMoreThan20Comm)}
        style={{ width: '70%' }}
        theme={theme}
      />
      <Checkbox
        label={t<string>('No oversubscribed')}
        onChange={() => setNoOversubscribed(!noOversubscribed)}
        style={{ width: '50%' }}
        theme={theme}
      />
      <Checkbox
        label={t<string>('No waiting')}
        onChange={() => setNoWaiting(!noWaiting)}
        style={{ width: '40%' }}
        theme={theme}
      />
      <SearchIcon sx={{ color: 'secondary.light', width: '10%' }} />
    </Grid>
  );

  const TableSubInfoWithClear = () => (
    <Grid container justifyContent='space-between' pt='5px'>
      <Grid item>
        <Typography sx={{ fontSize: '14px', fontWeight: 400 }}>
          {t('{{selectedCount}} of {{maxSelectable}} is selected', { replace: { selectedCount: newSelectedValidators?.length, maxSelectable: stakingConsts?.maxNominations } })}
        </Typography>
      </Grid>
      <Grid item>
        <Typography onClick={() => setNewSelectedValidators([])} sx={{ cursor: 'pointer', fontSize: '14px', fontWeight: 400, textDecorationLine: 'underline' }}>
          {t('Clear selection')}
        </Typography>
      </Grid>
    </Grid>
  );

  return (
    <Motion>
      <Popup show={show}>
        <HeaderBrand
          onBackClick={_onBackClick}
          shortBorder
          showBackArrow
          showClose
          text={title}
          withSteps={{
            current: 1,
            total: 2
          }}
        />
        <Grid container sx={{ justifyContent: 'center', p: '10px 15px' }}>
          <Grid container fontSize='14px' fontWeight='400' item pb='15px'>
            <Checkbox
              label={t<string>('ID only')}
              onChange={() => setIdOnly(!idOnly)}
              style={{ pb: '5px', width: '30%' }}
              theme={theme}
            />
            <Checkbox
              label={t<string>('No more than 20 Commission')}
              onChange={() => setNoMoreThan20Comm(!noMoreThan20Comm)}
              style={{ width: '70%' }}
              theme={theme}
            />
            <Checkbox
              label={t<string>('No oversubscribed')}
              onChange={() => setNoOversubscribed(!noOversubscribed)}
              style={{ width: '50%' }}
              theme={theme}
            />
            <Checkbox
              label={t<string>('No waiting')}
              onChange={() => setNoWaiting(!noWaiting)}
              style={{ width: '40%' }}
              theme={theme}
            />
            <SearchIcon sx={{ color: 'secondary.light', width: '10%' }} />
          </Grid>
          <Grid item xs={12}>
            {validatorsToList &&
              <ValidatorsTable
                allValidatorsIdentities={allValidatorsIdentities}
                api={api}
                chain={chain}
                handleCheck={handleCheck}
                isSelected={isSelected}
                maxSelected={newSelectedValidators.length === stakingConsts?.maxNominations}
                selectedValidatorsId={selectedValidatorsId}
                setSelectedValidators={setNewSelectedValidators}
                showCheckbox
                staked={new BN(pool?.ledger?.active ?? 0)}
                stakingConsts={stakingConsts}
                validatorsToList={validatorsToList}
              />
            }
          </Grid>
          <TableSubInfoWithClear />
        </Grid>
        <PButton
          // _onClick={remove}
          disabled={!newSelectedValidators?.length}
          text={t<string>('Next')}
        />
      </Popup>
    </Motion>
  );
}
