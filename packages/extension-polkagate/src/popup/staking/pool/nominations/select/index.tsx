// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens unstake review page
 * */

import type { AccountId } from '@polkadot/types/interfaces';

import SearchIcon from '@mui/icons-material/Search';
import { Checkbox, FormControlLabel, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';

import { Checkbox2, Infotip, InputFilter, Motion, PButton, Popup } from '../../../../../components';
import { useTranslation } from '../../../../../hooks';
import { HeaderBrand } from '../../../../../partials';
import { DEFAULT_VALIDATOR_COMMISSION_FILTER } from '../../../../../util/constants';
import { AllValidators, MyPoolInfo, StakingConsts, ValidatorInfo } from '../../../../../util/types';
import { Data, getComparator, Order } from '../../../partial/comparators';
import Filters from '../../../partial/Filters';
import ValidatorsTable from '../../../solo/nominations/partials/ValidatorsTable';
import Review from './Review';

interface Props {
  address: string;
  allValidatorsIdentities: DeriveAccountInfo[] | null | undefined;
  allValidatorsInfo: AllValidators | null | undefined;
  api: ApiPromise;
  chain: Chain | null;
  formatted: AccountId | undefined
  title: string;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  selectedValidatorsId: AccountId[] | null | undefined;
  stakingConsts: StakingConsts | null | undefined;
  pool: MyPoolInfo;
}

export default function SelectValidators({ address, allValidatorsIdentities, allValidatorsInfo, api, chain, formatted, pool, selectedValidatorsId, setShow, show, stakingConsts, title }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const [systemSuggestion, setSystemSuggestion] = useState<boolean>();
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [validatorsToList, setValidatorsToList] = useState<ValidatorInfo[]>();
  const [newSelectedValidators, setNewSelectedValidators] = useState<ValidatorInfo[]>([]);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Data>('name');
  const [showReview, setShowReview] = useState<boolean>(false);
  const [keyword, setSearchKeyword] = useState('');

  useEffect(() => {
    if (!allValidatorsInfo || !allValidatorsIdentities) {
      return;
    }

    let filteredValidators = validatorsToList ?? allValidatorsInfo.current.concat(allValidatorsInfo.waiting);

    // at first filtered blocked allValidatorsInfo
    filteredValidators = filteredValidators?.filter((v) => !v.validatorPrefs.blocked);

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
  }, [stakingConsts, allValidatorsInfo, allValidatorsIdentities, order, orderBy]);

  const _onBackClick = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const onFilters = useCallback(() => {
    setShowFilters(true);
  }, []);

  const onSearch = useCallback((filter: string) => {
    setSearchKeyword(filter);
  }, []);

  const isSelected = useCallback((v: ValidatorInfo) => newSelectedValidators.indexOf(v) !== -1, [newSelectedValidators]);

  const handleCheck = useCallback((e: React.ChangeEvent<HTMLInputElement>, validator: ValidatorInfo) => {
    const checked = e.target.checked;

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
          noBorder
          onBackClick={_onBackClick}
          paddingBottom={0}
          showBackArrow
          showClose
          text={title}
          withSteps={{
            current: 1,
            total: 2
          }}
        />
        <Grid container sx={{ justifyContent: 'flex-start', px: '15px' }}>
          <Grid container item justifyContent='center' ml='-15px'>
            <Infotip
              iconLeft={6}
              iconTop={6}
              showQuestionMark text={t<string>('We suggest trusted, high return, low commission validators which not slashed before.')}>
              <Checkbox2
                checked={systemSuggestion}
                label={t<string>('System Suggestions')}
                labelStyle={{ fontSize: '16px', fontWeight: '400' }}
                onChange={() => setSystemSuggestion(!systemSuggestion)}
              />
            </Infotip>
          </Grid>
          <Grid item justifyContent='flex-start' py='10px' width='73%'>
            <InputFilter
              autoFocus={false}
              onChange={onSearch}
              placeholder={t<string>('🔍 Search validator')}
              theme={theme}
              value={keyword}
              withReset
            />
          </Grid>
          <Grid alignItems='center' container fontSize='16px' fontWeight={400} item justifyContent='flex-start' pl='15px' py='10px' width='27%'>
            {t('Filters')}
            <Grid alignItems='center' container item pl='10px' justifyContent='center' onClick={onFilters}
              sx={{ cursor: 'pointer', width: '40%' }}>
              <vaadin-icon icon='vaadin:ellipsis-dots-v' style={{ color: `${theme.palette.secondary.light}`, width: '33px' }} />
            </Grid>
          </Grid>
          {/* <Grid container fontSize='14px' fontWeight='400' item pb='15px'>
        
            <Checkbox2
              checked={noMoreThan20Comm}
              label={t<string>('No more than 20 Commission')}
              onChange={() => setNoMoreThan20Comm(!noMoreThan20Comm)}
              style={{ width: '70%', fontSize: '14px' }}
            />
            <Checkbox2
              checked={noOversubscribed}
              label={t<string>('No oversubscribed')}
              onChange={() => setNoOversubscribed(!noOversubscribed)}
              style={{ width: '50%' }}
            />
            <Checkbox2
              checked={noWaiting}
              label={t<string>('No waiting')}
              onChange={() => setNoWaiting(!noWaiting)}
              style={{ width: '40%' }}
            />
          </Grid> */}
          <Grid item xs={12}>
            {validatorsToList &&
              <ValidatorsTable
                allValidatorsIdentities={allValidatorsIdentities}
                api={api}
                chain={chain}
                decimal={pool?.decimal}
                formatted={pool?.stashIdAccount?.accountId?.toString()}
                handleCheck={handleCheck}
                height={window.innerHeight - 230}
                isSelected={isSelected}
                maxSelected={newSelectedValidators.length === stakingConsts?.maxNominations}
                selectedValidatorsId={selectedValidatorsId}
                setSelectedValidators={setNewSelectedValidators}
                showCheckbox
                staked={new BN(pool?.stashIdAccount?.stakingLedger?.active ?? 0)}
                stakingConsts={stakingConsts}
                token={pool?.token}
                validatorsToList={validatorsToList}
              />
            }
          </Grid>
          <TableSubInfoWithClear />
          {showFilters &&
            <Grid ml='-15px' position='absolute'>
              <Filters
                allValidatorsIdentities={allValidatorsIdentities}
                allValidatorsInfo={allValidatorsInfo}
                newSelectedValidators={newSelectedValidators}
                setNewSelectedValidators={setNewSelectedValidators}
                setShow={setShowFilters}
                setValidatorsToList={setValidatorsToList}
                show={showFilters}
                stakingConsts={stakingConsts}
              />
            </Grid>
          }
        </Grid>
        <PButton
          _onClick={() => setShowReview(true)}
          disabled={!newSelectedValidators?.length}
          text={t<string>('Next')}
        />
      </Popup>
      {showReview && newSelectedValidators && api && formatted && pool &&
        <Review
          address={address}
          api={api}
          chain={chain}
          formatted={formatted}
          newSelectedValidators={newSelectedValidators}
          pool={pool}
          setShow={setShowReview}
          show={showReview}
          stakingConsts={stakingConsts}
        />
      }
    </Motion>
  );
}
