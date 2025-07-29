// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { FadeOnScroll } from '../../../components';
import { useStakingConsts2, useTranslation, useValidatorsInformation } from '../../../hooks';
import NominatorsTable from '../../../popup/staking/partial/NominatorsTable';
import Progress from '../../../popup/staking/partial/Progress';
import StakingActionButton from '../../../popup/staking/partial/StakingActionButton';
import { EasyStakeSide, type SelectedEasyStakingType } from '../util/utils';

interface Props {
  genesisHash: string | undefined;
  setSelectedStakingType: React.Dispatch<React.SetStateAction<SelectedEasyStakingType | undefined>>;
  setSide: React.Dispatch<React.SetStateAction<EasyStakeSide>>;
}

export default function SelectValidator ({ genesisHash, setSelectedStakingType, setSide }: Props) {
  const { t } = useTranslation();
  const refContainer = useRef(null);
  const stakingConsts = useStakingConsts2(genesisHash);
  const validatorsInfo = useValidatorsInformation(genesisHash);

  const [newSelectedValidators, setNewSelectedValidators] = useState<string[]>([]);

  const maximum = useMemo(() => stakingConsts?.maxNominations || 0, [stakingConsts?.maxNominations]);

  const nominatedValidatorsInformation = useMemo(() => {
    if (!validatorsInfo) {
      return undefined;
    }

    return [...validatorsInfo.validatorsInformation.elected, ...validatorsInfo.validatorsInformation.waiting];
  }, [validatorsInfo]);

  const isLoading = useMemo(() => nominatedValidatorsInformation === undefined, [nominatedValidatorsInformation]);
  const isLoaded = useMemo(() => nominatedValidatorsInformation && nominatedValidatorsInformation.length > 0, [nominatedValidatorsInformation]);

  const onSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedAddress = event.target.value;

    setNewSelectedValidators((prev) => {
      const current = prev || [];

      const existingIndex = newSelectedValidators.findIndex((val) => String(val) === String(selectedAddress));

      if (existingIndex >= 0) {
        if (current.length >= maximum) {
          return prev;
        }

        // Remove if exists
        const newArray = [...current];

        newArray.splice(existingIndex, 1);

        return newArray;
      } else {
        // Add if doesn't exist
        return [...current, selectedAddress];
      }
    });
  }, [maximum, newSelectedValidators]);
  const onApply = useCallback(() => {
    setSelectedStakingType({
      pool: undefined,
      type: 'solo',
      validators: undefined
    });
    setSide(EasyStakeSide.STAKING_TYPE);
  }, [setSelectedStakingType, setSide]);

  return (
    <Stack direction='row' ref={refContainer} sx={{ maxHeight: '500px', mt: '12px', overflowY: 'auto', px: '15px', width: '100%' }}>
      {isLoading &&
        <Progress
          text={t("Loading the validators' list")}
        />
      }
      {isLoaded &&
        <NominatorsTable
          genesisHash={genesisHash ?? ''}
          onSelect={onSelect}
          validatorsInformation={nominatedValidatorsInformation ?? []}
        />}
      <FadeOnScroll containerRef={refContainer} height='75px' ratio={0.6} />
      <StakingActionButton
        disabled={true}
        onClick={onApply}
        style={{
          bottom: '15px',
          height: '44px',
          left: '0',
          marginInline: '15px',
          position: 'absolute',
          right: '0',
          width: 'calc(100% - 30px)'
        }}
        text={t('Select')}
      />
    </Stack>
  );
}
