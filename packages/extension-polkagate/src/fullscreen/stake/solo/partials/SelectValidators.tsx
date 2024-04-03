// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens unstake review page
 * */

import type { AccountId } from '@polkadot/types/interfaces';

import { FilterAltOutlined as FilterIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { getComparator } from '@polkadot/extension-polkagate/src/popup/staking/partial/comparators';
import { BN } from '@polkadot/util';

import { Checkbox2, Infotip, InputFilter, Progress, Waiting } from '../../../../components';
import { useInfo, useTranslation, useValidators, useValidatorsIdentities } from '../../../../hooks';
import { DEFAULT_FILTERS, SYSTEM_SUGGESTION_TEXT, TEST_NETS } from '../../../../util/constants';
import { Filter, StakingConsts, ValidatorInfo, ValidatorInfoWithIdentity } from '../../../../util/types';
import Filters from './Filters';
import ValidatorsTable from './ValidatorsTable';

interface Props {
  address: string;
  nominatedValidatorsIds?: AccountId[] | null | undefined;
  stashId: AccountId;
  stakingConsts: StakingConsts | null | undefined;
  staked: BN;
  title: string;
  newSelectedValidators: ValidatorInfo[];
  setNewSelectedValidators: React.Dispatch<React.SetStateAction<ValidatorInfo[]>>;
}

const TableSubInfoWithClear = ({ maxSelectable, onClearSelection, selectedCount }: {selectedCount: number|undefined, maxSelectable: number|undefined, onClearSelection: () => void}) => {
  const { t } = useTranslation();

  return (
    <Grid container justifyContent='space-between' pt='5px'>
      <Grid item>
        <Typography sx={{ fontSize: '14px', fontWeight: 400 }}>
          {t('{{selectedCount}} of {{maxSelectable}} is selected', { replace: { maxSelectable, selectedCount } })}
        </Typography>
      </Grid>
      <Grid item>
        <Typography onClick={onClearSelection} sx={{ cursor: 'pointer', fontSize: '14px', fontWeight: 400, textDecorationLine: 'underline' }}>
          {t('Clear selection')}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default function SelectValidators ({ address, newSelectedValidators, nominatedValidatorsIds, setNewSelectedValidators, staked, stakingConsts, stashId }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { chain, decimal, genesisHash, token } = useInfo(address);

  const allValidatorsInfo = useValidators(address);
  const allValidatorsAccountIds = useMemo(() => allValidatorsInfo && allValidatorsInfo.current.concat(allValidatorsInfo.waiting)?.map((v) => v.accountId), [allValidatorsInfo]);
  const allValidatorsIdentities = useValidatorsIdentities(address, allValidatorsAccountIds);
  const allValidators = useMemo(() => allValidatorsInfo?.current?.concat(allValidatorsInfo.waiting)?.filter((v) => v.validatorPrefs.blocked === false || v.validatorPrefs.blocked?.isFalse), [allValidatorsInfo]);
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

      setValidatorsToList(newSelectedValidators.concat(notSelected));
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

    aDeepCopyOfValidators.sort((v1, v2) => ('' + v1?.identity?.displayParent).localeCompare(v2?.identity?.displayParent));

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

    const filtered3 = filtered2.filter((v) => TEST_NETS.includes(genesisHash) || v?.identity?.display); // filter has no identity

    return filtered3.sort(getComparator('Commissions')).slice(0, stakingConsts?.maxNominations);
  }, [genesisHash, onLimitValidatorsPerOperator]);

  const onFilters = useCallback(() => {
    if (systemSuggestion) {
      // remove system suggestions when click on filters
      setNewSelectedValidators([]);
      setSystemSuggestion(false);
    }

    setShowFilters(true);
  }, [setNewSelectedValidators, systemSuggestion]);

  const onSystemSuggestion = useCallback((event, checked: boolean) => {
    setSearchKeyword('');
    setSystemSuggestion(checked);
    checked
      ? allValidators && stakingConsts && setNewSelectedValidators([...selectBestValidators(allValidators, stakingConsts)])
      : setNewSelectedValidators([]);
  }, [allValidators, selectBestValidators, setNewSelectedValidators, stakingConsts]);

  const onSearch = useCallback((filter: string) => {
    // onSystemSuggestion(undefined, false);// to reset system suggestion on search
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
  }, [newSelectedValidators, setNewSelectedValidators, stakingConsts?.maxNominations]);

  return (
    <>
      {allValidators === undefined || !nominatedValidatorsIds === undefined
        ? <Waiting
          height={window.innerHeight - 630}
        />
        : <>
          <Grid container sx={{ justifyContent: 'flex-start' }}>
            <Grid alignItems='center' container item ml='2%' pr='3%' width='29%'>
              <Infotip
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
            <Grid item justifyContent='flex-start' ml='3%' py='10px' width='60%'>
              <InputFilter
                autoFocus={false}
                onChange={onSearch}
                placeholder={t<string>('🔍 Search validator')}
                theme={theme}
                value={searchKeyword ?? ''}
              />
            </Grid>
            <Grid alignItems='center' container fontSize='16px' fontWeight={400} item justifyContent='flex-end' onClick={onFilters} pl='15px' py='10px' sx={{ cursor: 'pointer' }} width='4%'>
              <FilterIcon sx={{ color: 'secondary.light' }} />
            </Grid>
            <Grid item xs={12}>
              {validatorsToList &&
                    <ValidatorsTable
                      allValidatorsIdentities={allValidatorsIdentities}
                      address={address}
                      formatted={stashId}
                      handleCheck={handleCheck}
                      height={window.innerHeight - 570}
                      isSelected={isSelected}
                      maxSelected={newSelectedValidators.length === stakingConsts?.maxNominations}
                      nominatedValidatorsIds={nominatedValidatorsIds}
                      setSelectedValidators={setNewSelectedValidators}
                      showCheckbox
                      staked={staked}
                      stakingConsts={stakingConsts}
                      token={token}
                      validatorsToList={validatorsToList}
                    />
              }
            </Grid>
            <TableSubInfoWithClear
              maxSelectable={ stakingConsts?.maxNominations}
              onClearSelection={onClearSelection}
              selectedCount={ newSelectedValidators?.length}
            />
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
        </>
      }
    </>
  );
}
