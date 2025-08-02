// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState } from 'react';

import { usePendingRewardsSolo, useTranslation } from '../../../../hooks';
import { PendingRewardsUI } from '../../../../popup/staking/solo-new/pendingReward';
import StakingPopup from '../../partials/StakingPopup';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow } from '../../util/utils';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  onClose: () => void;
}

export default function PendingRewards ({ address, genesisHash, onClose }: Props) {
  const { t } = useTranslation();
  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.NONE);

  const { adaptiveDecimalPoint,
    eraToDate,
    expandedRewards,
    onSelect,
    onSelectAll,
    selectedToPayout,
    totalSelectedPending,
    transactionInformation,
    tx } = usePendingRewardsSolo(address, genesisHash);

  const onNext = useCallback(() => setFlowStep(FULLSCREEN_STAKING_TX_FLOW.REVIEW), []);
  const onBack = useCallback(() => {
    setFlowStep(FULLSCREEN_STAKING_TX_FLOW.NONE);
    onClose();
  }, [onClose]);

  return (
    <StakingPopup
      address={address}
      flowStep={flowStep}
      genesisHash={genesisHash}
      maxHeight={650}
      onClose={onClose}
      setFlowStep={setFlowStep}
      title={t('Pending Rewards')}
      transaction={tx}
      transactionInformation={transactionInformation}
    >
      <PendingRewardsUI
        adaptiveDecimalPoint={adaptiveDecimalPoint}
        eraToDate={eraToDate}
        expandedRewards={expandedRewards}
        genesisHash={genesisHash}
        onBack={onBack}
        onSelect={onSelect}
        onSelectAll={onSelectAll}
        openReview={onNext}
        selectedToPayout={selectedToPayout}
        totalSelectedPending={totalSelectedPending}
      />
    </StakingPopup>
  );
}
