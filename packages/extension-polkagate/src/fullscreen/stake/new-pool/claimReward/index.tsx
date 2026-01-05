// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo, useState } from 'react';

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

  const title = useMemo(() => {
    switch (flowStep) {
      case FULLSCREEN_STAKING_TX_FLOW.WAIT_SCREEN:
        return PROCESSING_TITLE;

      case FULLSCREEN_STAKING_TX_FLOW.CONFIRMATION:
        return t('Confirmation');

      default:
        return t('Review');
    }
  }, [flowStep, t]);

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
      title={title}
      transaction={tx}
      transactionInformation={transactionInformation}
    />
  );
}
