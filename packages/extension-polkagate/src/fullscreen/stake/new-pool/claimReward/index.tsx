// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';

import { useClaimRewardPool, useTranslation } from '../../../../hooks';
import { PROCESSING_TITLE, PROXY_TYPE } from '../../../../util/constants';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow } from '../../util/utils';
import ClaimRewardsPopup from './partials/ClaimRewardsPopup';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  onClose: () => void;
}

export default function ClaimReward ({ address, genesisHash, onClose }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [restake, setRestake] = useState<boolean>(false);

  const { myClaimable, transactionInformation, tx } = useClaimRewardPool(address, genesisHash, restake);

  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.REVIEW);

  return (
    <ClaimRewardsPopup
      address={address}
      amount={myClaimable?.toString()}
      flowStep={flowStep}
      genesisHash={genesisHash}
      onClose={onClose}
      proxyTypeFilter={PROXY_TYPE.NOMINATION_POOLS}
      restake={restake}
      setFlowStep={setFlowStep}
      setRestake={setRestake}
      showBack
      title={
        flowStep === FULLSCREEN_STAKING_TX_FLOW.WAIT_SCREEN
          ? t(PROCESSING_TITLE)
          : t('Review')
      }
      transaction={tx}
      transactionInformation={transactionInformation}
    />
  );
}
