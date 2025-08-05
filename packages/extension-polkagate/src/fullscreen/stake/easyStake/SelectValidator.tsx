// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { GradientButton, Progress } from '../../../components';
import { useStakingConsts2, useTranslation, useValidatorsInformation } from '../../../hooks';
import NominatorsTable from '../../../popup/staking/partial/NominatorsTable';
import { EasyStakeSide, type SelectedEasyStakingType } from '../util/utils';

interface Props {
  genesisHash: string | undefined;
  setSelectedStakingType: React.Dispatch<React.SetStateAction<SelectedEasyStakingType | undefined>>;
  setSide: React.Dispatch<React.SetStateAction<EasyStakeSide>>;
  suggestedValidators: string[] | undefined;
  selectedStakingType: SelectedEasyStakingType | undefined;
}

export default function SelectValidator ({ genesisHash, selectedStakingType, setSelectedStakingType, setSide, suggestedValidators }: Props) {
  const { t } = useTranslation();
  const stakingConsts = useStakingConsts2(genesisHash);
  const validatorsInfo = useValidatorsInformation(genesisHash);

  const [newSelectedValidators, setNewSelectedValidators] = useState<string[] | undefined>(undefined);

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

  const isLoading = useMemo(() => validatorsToShow === undefined, [validatorsToShow]);
  const isLoaded = useMemo(() => validatorsToShow && validatorsToShow.length > 0, [validatorsToShow]);

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

  return (
    <Stack direction='row' sx={{ maxHeight: '515px', mt: '12px', overflowY: 'auto', position: 'relative', px: '15px', width: '100%', zIndex: 1 }}>
      {isLoading &&
        <Progress
          style={{ marginTop: '90px' }}
          title={t("Loading the validators' list")}
        />
      }
      {isLoaded &&
        <NominatorsTable
          genesisHash={genesisHash ?? ''}
          onSelect={onSelect}
          selected={newSelectedValidators}
          validatorsInformation={validatorsToShow ?? []}
        />}
      <GradientButton
        disabled={!newSelectedValidators?.length}
        onClick={onApply}
        style={{
          bottom: '0',
          height: '44px',
          left: '0',
          marginInline: '15px',
          position: 'absolute',
          right: '0',
          width: 'calc(100% - 30px)',
          zIndex: 10
        }}
        text={t('Select')}
      />
    </Stack>
  );
}
