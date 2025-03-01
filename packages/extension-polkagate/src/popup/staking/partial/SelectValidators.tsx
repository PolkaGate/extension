// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens unstake review page
 * */

import type { ApiPromise } from '@polkadot/api';
import type { DeriveAccountInfo } from '@polkadot/api-derive/types';
import type { AccountId } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { AllValidators, Filter, StakingConsts, ValidatorInfo, ValidatorInfoWithIdentity } from '../../../util/types';

import { FilterAltOutlined as FilterIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Checkbox2, Infotip, InputFilter, Motion, PButton, Popup, Progress } from '../../../components';
import { useInfo, useTranslation, useValidators, useValidatorsIdentities } from '../../../hooks';
import { HeaderBrand } from '../../../partials';
import { DEFAULT_FILTERS, SYSTEM_SUGGESTION_TEXT } from '../../../util/constants';
import { getComparator } from '../partial/comparators';
import Filters from '../partial/Filters';
import ValidatorsTable from './ValidatorsTable';

interface Props {
  address: string;
  validatorsIdentities?: DeriveAccountInfo[] | null | undefined;
  validatorsInfo?: AllValidators;
  api: ApiPromise | undefined;
  nominatedValidatorsIds?: string[] | AccountId[] | null | undefined;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  stashId: AccountId | string;
  stakingConsts: StakingConsts | null | undefined;
  staked: BN;
  title: string;
  newSelectedValidators: ValidatorInfo[];
  setNewSelectedValidators: React.Dispatch<React.SetStateAction<ValidatorInfo[]>>;
  setShowReview: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SelectValidators({ address, api, newSelectedValidators, nominatedValidatorsIds, setNewSelectedValidators, setShow, setShowReview, show, staked, stakingConsts, stashId, title, validatorsIdentities, validatorsInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { chain, decimal, token } = useInfo(address);

  const allValidatorsInfo = useValidators(address, validatorsInfo);
  const allValidatorsAccountIds = useMemo(() => allValidatorsInfo && allValidatorsInfo.current.concat(allValidatorsInfo.waiting)?.map((v) => v.accountId), [allValidatorsInfo]);
  const allValidatorsIdentities = useValidatorsIdentities(address, allValidatorsAccountIds, validatorsIdentities);
  const allValidators = useMemo(() => allValidatorsInfo?.current?.concat(allValidatorsInfo.waiting)?.filter((v) => (v.validatorPrefs.blocked as unknown as boolean) === false || v.validatorPrefs.blocked?.isFalse), [allValidatorsInfo]);
  const [systemSuggestion, setSystemSuggestion] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filteredValidators, setFilteredValidators] = useState<ValidatorInfo[] | undefined>(allValidators);
  const [validatorsToList, setValidatorsToList] = useState<ValidatorInfo[] | undefined>(allValidators);
  const [searchedValidators, setSearchedValidators] = useState<ValidatorInfo[] | undefined>(allValidators);
  const [searchKeyword, setSearchKeyword] = useState<string>();
  const [filters, setFilters] = useState<Filter>(structuredClone(DEFAULT_FILTERS) as Filter);
  const [sortValue, setSortValue] = useState<number>();
  const [apply, setApply] = useState<boolean>(false);

  useEffect(() => {
    /** initialization */
    if (allValidators?.length && !filteredValidators?.length) {
      setValidatorsToList(allValidators);
      setFilteredValidators(allValidators);
    }

    filteredValidators?.length && setValidatorsToList(filteredValidators);
  }, [allValidators, filteredValidators, filteredValidators?.length]);

  useEffect(() => {
    /** apply filtered validators on searched validators */
    searchedValidators?.length &&
      setValidatorsToList([...filteredValidators?.filter((f) => searchedValidators?.find((s) => s.accountId === f.accountId)) || []]);
  }, [searchedValidators, filteredValidators]);

  useEffect(() => {
    /** show selected validators  on top */
    if (systemSuggestion && newSelectedValidators?.length) {
      const notSelected = allValidators?.filter((a) => !newSelectedValidators.find((n) => a.accountId === n.accountId));

      setValidatorsToList(newSelectedValidators.concat(notSelected as ValidatorInfo[]));
    }
  }, [systemSuggestion, newSelectedValidators, allValidators]);

  const applySearch = useCallback((keyword: string) => {
    const validatorsWithIdentity = allValidators?.map((v: ValidatorInfoWithIdentity) => {
      v.identity = allValidatorsIdentities?.find((vi) => vi.accountId === v.accountId)?.identity;

      return v;
    });

    const searched = validatorsWithIdentity?.filter((v) =>
      `${v.identity?.display}${v.identity?.displayParent}`.toLowerCase().includes(keyword.toLowerCase()) ||
      String(v.accountId).toLowerCase().includes(keyword.toLowerCase())
    );

    setSearchedValidators(searched?.length ? [...searched] : []);
  }, [allValidatorsIdentities, allValidators]);

  const onLimitValidatorsPerOperator = useCallback((validators: ValidatorInfoWithIdentity[] | undefined, limit: number): ValidatorInfoWithIdentity[] => {
    if (!validators?.length) {
      return [];
    }

    const aDeepCopyOfValidators = JSON.parse(JSON.stringify(validators)) as ValidatorInfoWithIdentity[];

    aDeepCopyOfValidators.forEach((v) => {
      const vId = allValidatorsIdentities?.find((vi) => vi.accountId === v.accountId);

      v.identity = vId?.identity;
    });

    aDeepCopyOfValidators.sort((v1, v2) => ('' + v1?.identity?.displayParent).localeCompare(v2?.identity?.displayParent as string));

    let counter = 1;
    let indicator = aDeepCopyOfValidators[0];

    return aDeepCopyOfValidators.filter((v, index) => {
      if (indicator.identity?.displayParent && indicator.identity?.displayParent === v.identity?.displayParent && limit > counter++) {
        return true;
      }

      if (indicator.identity?.displayParent && indicator.identity?.displayParent === v.identity?.displayParent) {
        return false;
      }

      counter = 1;
      indicator = aDeepCopyOfValidators[index + 1];

      return true;
    });
  }, [allValidatorsIdentities]);

  // TODO: use useValidatorSuggestion hook instead
  const selectBestValidators = useCallback((allValidators: ValidatorInfo[], stakingConsts: StakingConsts): ValidatorInfo[] => {
    const filtered1 = allValidators.filter((v) =>
      Number(v.validatorPrefs.commission) !== 0 && // filter 0 commission validators, to exclude new and chilled validators
      (Number(v.validatorPrefs.commission) / (10 ** 7)) < DEFAULT_FILTERS.maxCommission.value && // filter high commission validators
      v.exposure.others.length && v.exposure.others.length < stakingConsts?.maxNominatorRewardedPerValidator// filter oversubscribed
    );

    const filtered2 = onLimitValidatorsPerOperator(filtered1, DEFAULT_FILTERS.limitOfValidatorsPerOperator.value);

    const filtered3 = filtered2.filter((v) => v?.identity?.display); // filter has no identity

    return filtered3.sort(getComparator('Commissions')).slice(0, stakingConsts?.maxNominations);
  }, [onLimitValidatorsPerOperator]);

  const _onBackClick = useCallback(() => {
    // clearFilters();
    setShow(false);
  }, [setShow]);

  const onFilters = useCallback(() => {
    if (systemSuggestion) {
      // remove system suggestions when click on filters
      setNewSelectedValidators([]);
      setSystemSuggestion(false);
    }

    setShowFilters(true);
  }, [setNewSelectedValidators, systemSuggestion]);

  const onSystemSuggestion = useCallback((_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setSearchKeyword('');
    setSystemSuggestion(checked);
    checked
      ? allValidators && stakingConsts && setNewSelectedValidators([...selectBestValidators(allValidators, stakingConsts)])
      : setNewSelectedValidators([]);
  }, [allValidators, selectBestValidators, setNewSelectedValidators, stakingConsts]);

  const onSearch = useCallback((filter: string) => {
    setSystemSuggestion(false);

    setSearchKeyword(filter);
    applySearch(filter);
  }, [applySearch]);

  const onClearSelection = useCallback(() => {
    setNewSelectedValidators([]);
    setSystemSuggestion(false);
  }, [setNewSelectedValidators]);

  const isSelected = useCallback((v: ValidatorInfo) =>
    !!newSelectedValidators.find((n) => n.accountId === v.accountId)
    , [newSelectedValidators]);

  const handleCheck = useCallback((e: React.ChangeEvent<HTMLInputElement>, validator: ValidatorInfo) => {
    const checked = e.target.checked;

    setSystemSuggestion(false);

    if (stakingConsts?.maxNominations && newSelectedValidators.length >= stakingConsts.maxNominations && checked) {
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
  }, [newSelectedValidators, setNewSelectedValidators, stakingConsts?.maxNominations]);

  const TableSubInfoWithClear = () => (
    <Grid container justifyContent='space-between' pt='5px'>
      <Grid item>
        <Typography sx={{ fontSize: '14px', fontWeight: 400 }}>
          {t('{{selectedCount}} of {{maxSelectable}} is selected', { replace: { selectedCount: newSelectedValidators?.length, maxSelectable: stakingConsts?.maxNominations } })}
        </Typography>
      </Grid>
      <Grid item>
        <Typography onClick={onClearSelection} sx={{ cursor: 'pointer', fontSize: '14px', fontWeight: 400, textDecorationLine: 'underline' }}>
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
        <>
          {allValidators === undefined || !nominatedValidatorsIds === undefined
            ? <Progress
              pt='125px'
              size={125}
              title={t('Loading the validators\' list ...')}
              type='grid'
            />
            : <>
              <Grid container sx={{ justifyContent: 'flex-start', px: '15px' }}>
                <Grid container item justifyContent='center' ml='-15px'>
                  <Infotip
                    iconLeft={6}
                    placement='top'
                    showQuestionMark
                    text={t<string>(SYSTEM_SUGGESTION_TEXT)}
                  >
                    <Checkbox2
                      checked={systemSuggestion}
                      label={t<string>('System Suggestions')}
                      labelStyle={{ fontSize: '16px', fontWeight: 400 }}
                      onChange={onSystemSuggestion}
                    />
                  </Infotip>
                </Grid>
                <Grid item justifyContent='flex-start' py='10px' width='73%'>
                  <InputFilter
                    autoFocus={false}
                    onChange={onSearch}
                    placeholder={t<string>('🔍 Search validator')}
                    theme={theme}
                    value={searchKeyword ?? ''}
                  />
                </Grid>
                <Grid alignItems='center' container fontSize='16px' fontWeight={400} item justifyContent='flex-end' onClick={onFilters} pl='15px' py='10px' width='27%' sx={{ cursor: 'pointer' }}>
                  <FilterIcon sx={{ color: 'secondary.light' }} />
                </Grid>
                <Grid item xs={12}>
                  {validatorsToList &&
                    <ValidatorsTable
                      allValidatorsIdentities={allValidatorsIdentities}
                      api={api}
                      chain={chain}
                      decimal={decimal}
                      formatted={stashId}
                      handleCheck={handleCheck}
                      height={window.innerHeight - 230}
                      isSelected={isSelected}
                      maxSelected={newSelectedValidators.length === stakingConsts?.maxNominations}
                      nominatedValidatorsIds={nominatedValidatorsIds}
                      showCheckbox
                      staked={staked}
                      stakingConsts={stakingConsts}
                      token={token}
                      validatorsToList={validatorsToList}
                    />
                  }
                </Grid>
                <TableSubInfoWithClear />
                {showFilters &&
                  <Grid ml='-15px' position='absolute'>
                    <Filters
                      allValidators={searchKeyword ? searchedValidators : allValidators}
                      allValidatorsIdentities={allValidatorsIdentities}
                      apply={apply}
                      filters={filters}
                      newSelectedValidators={newSelectedValidators}
                      onLimitValidatorsPerOperator={onLimitValidatorsPerOperator}
                      setApply={setApply}
                      setFilteredValidators={setFilteredValidators}
                      setFilters={setFilters}
                      setNewSelectedValidators={setNewSelectedValidators}
                      setShow={setShowFilters}
                      setSortValue={setSortValue}
                      show={showFilters}
                      sortValue={sortValue}
                      stakingConsts={stakingConsts}
                    />
                  </Grid>
                }
              </Grid>
              <PButton
                // eslint-disable-next-line react/jsx-no-bind
                _onClick={() => setShowReview(true)}
                disabled={!newSelectedValidators?.length}
                text={t<string>('Next')}
              />
            </>
          }
        </>
      </Popup>
    </Motion>
  );
}
