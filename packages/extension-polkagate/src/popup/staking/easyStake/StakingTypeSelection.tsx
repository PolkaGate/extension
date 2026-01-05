// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */

import type { PositionInfo } from '../../../util/types';

import { Grid } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { BackWithLabel, DecisionButtons, Motion } from '../../../components';
import StakingTypeSelectionFS, { type StakingTypeSelectionProps } from '../../../fullscreen/stake/easyStake/StakingTypeSelection';
import { EasyStakeSide, type SelectedEasyStakingType } from '../../../fullscreen/stake/util/utils';
import { useTranslation } from '../../../hooks';

interface Props extends Partial<StakingTypeSelectionProps> {
  genesisHash: string | undefined;
  suggestedValidators: string[] | undefined;
}

export default function StakingTypeSelection ({ genesisHash, initialPool, selectedStakingType, setSelectedStakingType, setSide, suggestedValidators }: Props) {
  const { t } = useTranslation();

  const selectedPosition = useMemo(() => ({
    genesisHash,
    suggestedValidators
  } as PositionInfo), [genesisHash, suggestedValidators]);

  const onBack = useCallback(() => setSide?.(EasyStakeSide.INPUT), [setSide]);

  return (
    <Motion style={{ height: 'calc(100vh - 50px)' }} variant='slide'>
      <BackWithLabel
        onClick={onBack}
        stepCounter={{ currentStep: 1, totalSteps: 2 }}
        style={{ pb: 0 }}
        text={t('Staking type')}
      />
      <StakingTypeSelectionFS
        initialPool={initialPool}
        selectedPosition={selectedPosition}
        selectedStakingType={selectedStakingType}
        setSelectedStakingType={setSelectedStakingType as React.Dispatch<React.SetStateAction<SelectedEasyStakingType | undefined>>}
        setSide={setSide as React.Dispatch<React.SetStateAction<EasyStakeSide>>}
      />
      <Grid container item sx={{ bottom: '18px', height: '44px', marginInline: '18px', position: 'absolute', width: 'calc(100% - 36px)' }}>
        <DecisionButtons
          cancelButton
          direction='horizontal'
          onPrimaryClick={onBack}
          onSecondaryClick={onBack}
          primaryBtnText={t('Apply')}
          secondaryBtnText={t('Back')}
          style={{ gap: '12px' }}
        />
      </Grid>
    </Motion>
  );
}
