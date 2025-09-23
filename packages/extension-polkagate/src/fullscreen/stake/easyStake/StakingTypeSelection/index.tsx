// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo, PositionInfo } from '../../../../util/types';

import { Grid, Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { useChainInfo, useIsExtensionPopup, usePoolConst, useStakingConsts, useTranslation } from '../../../../hooks';
import { StakingInfoStack } from '../../../../popup/staking/partial/NominatorsTable';
import { areArraysEqual } from '../../../../util';
import { EasyStakeSide, type SelectedEasyStakingType } from '../../util/utils';
import { SelectedPoolInformation } from './SelectedPoolInformation';
import { SelectedValidatorsInformation } from './SelectedValidatorsInformation';
import { StakingTypeItem } from './StakingTypeItem';

export interface StakingTypeSelectionProps {
  setSelectedStakingType: React.Dispatch<React.SetStateAction<SelectedEasyStakingType | undefined>>;
  selectedStakingType: SelectedEasyStakingType | undefined;
  setSide: React.Dispatch<React.SetStateAction<EasyStakeSide>>;
  initialPool: PoolInfo | null | undefined;
  selectedPosition: PositionInfo | undefined;
}

export default function StakingTypeSelection ({ initialPool, selectedPosition, selectedStakingType, setSelectedStakingType, setSide }: StakingTypeSelectionProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const poolStakingConsts = usePoolConst(selectedPosition?.genesisHash);
  const stakingConsts = useStakingConsts(selectedPosition?.genesisHash);
  const { decimal, token } = useChainInfo(selectedPosition?.genesisHash, true);
  const isExtension = useIsExtensionPopup();

  const textColor = useMemo(() => isExtension ? theme.palette.text.highlight : '#AA83DC', [isExtension, theme.palette.text.highlight]);

  const isRecommendedValidators = useMemo(() =>
    !selectedStakingType?.validators ||
    (selectedPosition?.suggestedValidators && selectedStakingType?.validators && areArraysEqual([selectedPosition.suggestedValidators, selectedStakingType.validators]))
    , [selectedPosition?.suggestedValidators, selectedStakingType?.validators]);

  const onOptions = useCallback((type: 'pool' | 'solo') => () => {
    if (!selectedPosition || !initialPool) {
      return;
    }

    type === 'pool' &&
      setSelectedStakingType({
        pool: initialPool,
        type,
        validators: undefined
      });

    type === 'solo' &&
      setSelectedStakingType({
        pool: undefined,
        type,
        validators: selectedPosition.suggestedValidators
      });
  }, [initialPool, selectedPosition, setSelectedStakingType]);

  const openSelectPool = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setSide(EasyStakeSide.SELECT_POOL);
  }, [setSide]);

  const openSelectValidator = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setSide(EasyStakeSide.SELECT_VALIDATORS);
  }, [setSide]);

  return (
    <Stack direction='column' sx={{ gap: '8px', p: '18px' }}>
      <StakingTypeItem
        isSelected={selectedStakingType?.type === 'pool'}
        onClick={onOptions('pool')}
        type='pool'
      >
        <Stack direction='column'>
          <Grid container item sx={{ alignItems: 'center', gap: '16px', pb: '24px', pl: '24px' }}>
            <StakingInfoStack adjustedColorForTitle={textColor} amount={poolStakingConsts?.minJoinBond} decimal={decimal} title={t('Minimum Stake')} token={token} />
            <StakingInfoStack adjustedColorForTitle={textColor} text={t('Claim manually')} title={t('Rewards')} />
          </Grid>
          <SelectedPoolInformation
            genesisHash={selectedPosition?.genesisHash}
            isExtension={isExtension}
            onClick={openSelectPool}
            open={selectedStakingType?.type === 'pool'}
            poolDetail={selectedStakingType?.pool ?? initialPool}
          />
        </Stack>
      </StakingTypeItem>
      <StakingTypeItem
        isSelected={selectedStakingType?.type === 'solo'}
        onClick={onOptions('solo')}
        type='solo'
      >
        <Stack direction='column'>
          <Stack direction='column' sx={{ gap: '18px', pb: '24px', pl: '24px' }}>
            <Typography color={textColor} textAlign='left' variant='B-4'>
              {t('Advanced staking management')}
            </Typography>
            <Grid container item sx={{ alignItems: 'center', gap: '16px' }}>
              <StakingInfoStack adjustedColorForTitle={textColor} amount={stakingConsts?.minNominatorBond} decimal={decimal} title={t('Minimum Stake')} token={token} />
              <StakingInfoStack adjustedColorForTitle={textColor} text={t('Paid automatically')} title={t('Rewards')} />
            </Grid>
          </Stack>
          <SelectedValidatorsInformation
            isExtension={isExtension}
            isRecommended={!!isRecommendedValidators}
            onClick={openSelectValidator}
            open={selectedStakingType?.type === 'solo'}
            validators={selectedStakingType?.validators ?? selectedPosition?.suggestedValidators}
          />
        </Stack>
      </StakingTypeItem>
    </Stack>
  );
}
