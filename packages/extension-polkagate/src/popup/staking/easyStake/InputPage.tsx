// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { BackWithLabel, Motion } from '../../../components';
import InputPageFS, { type InputPageProp } from '../../../fullscreen/stake/easyStake/InputPage';
import { useChainInfo, useTranslation } from '../../../hooks';
import StakingActionButton from '../partial/StakingActionButton';

interface Props extends InputPageProp {
  buttonDisabled: boolean;
  openReview: () => void;
}

export default function InputPage ({ amount, availableBalanceToStake, buttonDisabled, errorMessage, genesisHash, loading, onChangeAmount, onMaxMinAmount, openReview, rate, selectedStakingType, setSide, stakingConsts }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useChainInfo(genesisHash, true);

  const onBack = useCallback(() => navigate('/stakingIndex-options') as void, [navigate]);

  return (
    <Motion variant='slide'>
      <BackWithLabel
        onClick={onBack}
        stepCounter={{ currentStep: 1, totalSteps: 2 }}
        style={{ pb: 0 }}
        text={t('Stake {{token}}', { replace: { token } })}
      />
      <InputPageFS
        amount={amount}
        availableBalanceToStake={availableBalanceToStake}
        errorMessage={errorMessage}
        genesisHash={genesisHash}
        loading={loading}
        onChangeAmount={onChangeAmount}
        onMaxMinAmount={onMaxMinAmount}
        rate={rate}
        selectedStakingType={selectedStakingType}
        setSide={setSide}
        stakingConsts={stakingConsts}
      />
      <StakingActionButton
        disabled={buttonDisabled || loading}
        onClick={openReview}
        style={{ marginInline: '18px', marginTop: '10px', width: 'calc(100% - 36px)' }}
        text={loading ? t('Loading ...') : t('Continue')}
      />
    </Motion>
  );
}
