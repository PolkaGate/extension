// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SelectValidatorProps } from '../../../fullscreen/stake/easyStake/SelectValidator';

import { Grid, Stack } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DecisionButtons, FadeOnScroll, Motion, Progress } from '../../../components';
import { EasyStakeSide } from '../../../fullscreen/stake/util/utils';
import { useStakingConsts, useTranslation, useValidatorsInformation } from '../../../hooks';
import Search from '../components/Search';
import NominatorsTable from '../partial/NominatorsTable';

export default function SelectValidator ({ genesisHash, selectedStakingType, setSelectedStakingType, setSide, suggestedValidators }: SelectValidatorProps) {
  const { t } = useTranslation();
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

    let filtered = nominatedValidatorsInformation.slice();

    if (searchedQuery) {
      const lowerCaseKeyword = searchedQuery.toLowerCase();

      filtered = filtered.filter(({ accountId, identity }) =>
        accountId.toString().toLowerCase().includes(lowerCaseKeyword) ||
        (identity?.display?.toLowerCase() ?? '').includes(lowerCaseKeyword) ||
        (identity?.displayParent?.toLowerCase() ?? '').includes(lowerCaseKeyword)
      );
    }

    return filtered.sort((val1, val2) => {
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
  }, [nominatedValidatorsInformation, searchedQuery, newSelectedValidators]);

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

  const isLoading = useMemo(() => validatorsToShow === undefined, [validatorsToShow]);
  const isLoaded = useMemo(() => validatorsToShow && validatorsToShow.length > 0, [validatorsToShow]);

  const onSearch = useCallback((input: string) => {
    setSearch(input);
  }, []);
  const onBack = useCallback(() => setSide?.(EasyStakeSide.STAKING_TYPE), [setSide]);
  const onNext = useCallback(() => {
    setSelectedStakingType({
      pool: undefined,
      type: 'solo',
      validators: newSelectedValidators ?? suggestedValidators ?? []
    });
    setSide(EasyStakeSide.STAKING_TYPE);
  }, [newSelectedValidators, setSelectedStakingType, setSide, suggestedValidators]);

  return (
    <Motion style={{ height: 'calc(100vh - 50px)' }} variant='slide'>
      <Stack direction='column' sx={{ maxHeight: '530px', mt: '12px', overflowY: 'auto', px: '15px', width: '100%' }}>
        <Search onSearch={onSearch} style={{ mb: '15px', width: '100%' }} />
        {isLoading &&
          <Progress
            style={{ marginTop: '90px' }}
            title={t("Loading the validators' list")}
          />
        }
        {isLoaded &&
          <NominatorsTable
            genesisHash={genesisHash ?? ''}
            height={480}
            onSelect={onSelect}
            selected={newSelectedValidators}
            validatorsInformation={validatorsToShow ?? []}
          />}
      </Stack>
      <FadeOnScroll containerRef={null} height='110px' ratio={0.5} showAnyway />
      <Grid container item sx={{ bottom: '15px', height: '44px', left: '0', m: 'auto', position: 'absolute', right: '0', width: 'calc(100% - 36px)', zIndex: 10 }}>
        <DecisionButtons
          cancelButton
          direction='horizontal'
          disabled={!newSelectedValidators?.length}
          divider
          onPrimaryClick={onNext}
          onSecondaryClick={onBack}
          primaryBtnText={t('{{count}} validator{{plural}} selected', { replace: { count: newSelectedValidators?.length, plural: newSelectedValidators?.length === 1 ? '' : 's' } })}
          secondaryBtnText={t('Back')}
        />
      </Grid>
    </Motion>
  );
}
