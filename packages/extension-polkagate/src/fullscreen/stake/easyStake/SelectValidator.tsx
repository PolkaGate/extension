// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { NothingFound } from '@polkadot/extension-polkagate/src/partials';

import { DecisionButtons, FadeOnScroll, Progress, SearchField } from '../../../components';
import { useStakingConsts, useTranslation, useValidatorsInformation } from '../../../hooks';
import { EasyStakeSide, type SelectedEasyStakingType } from '../util/utils';
import ValidatorsTable from './partials/ValidatorsTable';

export interface SelectValidatorProps {
  genesisHash: string | undefined;
  setSelectedStakingType: React.Dispatch<React.SetStateAction<SelectedEasyStakingType | undefined>>;
  setSide: React.Dispatch<React.SetStateAction<EasyStakeSide>>;
  suggestedValidators: string[] | undefined;
  selectedStakingType: SelectedEasyStakingType | undefined;
}

function SelectValidator({ genesisHash, selectedStakingType, setSelectedStakingType, setSide, suggestedValidators }: SelectValidatorProps) {
  const { t } = useTranslation();
  const refContainer = useRef(null);

  const stakingConsts = useStakingConsts(genesisHash);
  const validatorsInfo = useValidatorsInformation(genesisHash);

  const [newSelectedValidators, setNewSelectedValidators] = useState<string[] | undefined>(undefined);
  const [searchedQuery, setSearch] = useState<string>('');

  useEffect(() => {
    if (newSelectedValidators) {
      return;
    }

    if (selectedStakingType?.validators) {
      setNewSelectedValidators(selectedStakingType.validators);

      return;
    }

    if (!suggestedValidators) {
      setNewSelectedValidators(suggestedValidators);
    }
  }, [newSelectedValidators, selectedStakingType?.validators, suggestedValidators]);

  const maximum = useMemo(() => stakingConsts?.maxNominations || 0, [stakingConsts?.maxNominations]);

  const nominatedValidatorsInformation = useMemo(() => {
    if (!validatorsInfo) {
      return undefined;
    }

    return [...validatorsInfo.validatorsInformation.elected, ...validatorsInfo.validatorsInformation.waiting];
  }, [validatorsInfo]);

  const validatorsToShow = useMemo(() => {
    if (!nominatedValidatorsInformation) {
      return undefined;
    }

    return nominatedValidatorsInformation.sort((val1, val2) => {
      const aNominated = newSelectedValidators?.includes(val1.accountId.toString());
      const bNominated = newSelectedValidators?.includes(val2.accountId.toString());

      if (aNominated && !bNominated) {
        return -1;
      }

      if (!aNominated && bNominated) {
        return 1;
      }

      return 0;
    });
  }, [nominatedValidatorsInformation, newSelectedValidators]);

  const filtered = useMemo(() => {
    if (!validatorsToShow) {
      return validatorsToShow;
    }

    let filtered = validatorsToShow;
    const lowerCaseKeyword = searchedQuery.toLowerCase();

    if (lowerCaseKeyword) {
      filtered = filtered.filter(({ accountId, identity }) =>
        accountId.toString().toLowerCase().includes(lowerCaseKeyword) ||
        (identity?.display?.toLowerCase() ?? '').includes(lowerCaseKeyword) ||
        (identity?.displayParent?.toLowerCase() ?? '').includes(lowerCaseKeyword)
      );
    }

    return filtered;
  }, [searchedQuery, validatorsToShow]);

  const isLoading = useMemo(() => validatorsToShow === undefined, [validatorsToShow]);
  const isLoaded = useMemo(() => validatorsToShow && validatorsToShow.length > 0, [validatorsToShow]);

  const onSearch = useCallback((input: string) => {
    setSearch(input);
  }, []);

  const onSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedAddress = event.target.value;

    newSelectedValidators && setNewSelectedValidators((prev) => {
      const current = prev || [];

      const existingIndex = newSelectedValidators.findIndex((val) => String(val) === String(selectedAddress));

      if (existingIndex >= 0) {
        // Remove if exists
        const newArray = [...current];

        newArray.splice(existingIndex, 1);

        return newArray;
      } else {
        // Don't add if it reached the maximum
        if (current.length >= maximum) {
          return prev;
        }

        // Add if doesn't exist
        return [...current, selectedAddress];
      }
    });
  }, [maximum, newSelectedValidators]);

  const onApply = useCallback(() => {
    setSelectedStakingType({
      pool: undefined,
      type: 'solo',
      validators: newSelectedValidators ?? suggestedValidators ?? []
    });
    setSide(EasyStakeSide.STAKING_TYPE);
  }, [newSelectedValidators, setSelectedStakingType, setSide, suggestedValidators]);

  const onClear = useCallback(() => {
    setNewSelectedValidators([]);
    setSearch('');
  }, []);

  return (
    <>
      <Stack direction='column' ref={refContainer} sx={{ height: 'fit-content', maxHeight: '620px', minHeight: '620px', mt: '12px', position: 'relative', px: '15px', width: '100%', zIndex: 1 }}>
        {isLoading &&
          <Progress
            style={{ marginTop: '90px' }}
            title={t("Loading the validators' list")}
          />
        }
        {isLoaded &&
          <>
            <SearchField
              onInputChange={onSearch}
              placeholder={t('🔍 Search')}
              style={{
                height: '44px',
                margin: '17px 0 18px',
                width: '410px'
              }}
            />
            {filtered && filtered.length > 0 && genesisHash &&
              <ValidatorsTable
                genesisHash={genesisHash}
                onSelect={onSelect}
                selected={newSelectedValidators}
                validatorsInformation={filtered}
              />}
            <NothingFound
              show={isLoaded && filtered?.length === 0}
              style={{ pt: '80px' }}
              text={t('Validator(s) Not Found')}
            />
          </>}
        <DecisionButtons
          cancelButton
          direction='horizontal'
          disabled={!newSelectedValidators?.length}
          divider
          dividerStyle={{ background: 'linear-gradient(180deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)' }}
          onPrimaryClick={onApply}
          onSecondaryClick={onClear}
          primaryBtnText={!newSelectedValidators?.length ? t('Next') : t('{{count}} validator{{plural}} selected', { replace: { count: newSelectedValidators?.length, plural: newSelectedValidators?.length === 1 ? '' : 's' } })}
          secondaryBtnText={t('Clear')}
          secondaryButtonProps={{ style: { width: '134px' } }}
          style={{
            bottom: '15px',
            display: 'flex',
            flexDirection: 'row-reverse',
            height: '44px',
            left: '0',
            position: 'absolute',
            right: '0',
            width: '94%',
            zIndex: 10
          }}
        />
      </Stack>
      <FadeOnScroll containerRef={refContainer} height='110px' ratio={0.7} />
    </>
  );
}

export default memo(SelectValidator);
