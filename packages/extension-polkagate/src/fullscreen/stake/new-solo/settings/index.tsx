// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState } from 'react';

import { useSoloSettings, useTranslation } from '../../../../hooks';
import { Content } from '../../../../popup/staking/solo-new/settings';
import { PROXY_TYPE } from '../../../../util/constants';
import StakingPopup from '../../partials/StakingPopup';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow } from '../../util/utils';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  onClose: () => void;
}

export default function Settings ({ address, genesisHash, onClose }: Props) {
  const { t } = useTranslation();

  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.NONE);

  const { ED,
    changeToStaked,
    nextDisabled,
    rewardDestinationAddress,
    rewardDestinationType,
    setRewardDestinationType,
    setSpecificAccount,
    specificAccount,
    transactionInformation,
    tx } = useSoloSettings(address, genesisHash);

  const onNext = useCallback(() => setFlowStep?.(FULLSCREEN_STAKING_TX_FLOW.REVIEW), [setFlowStep]);

  return (
    <StakingPopup
      address={address}
      flowStep={flowStep}
      genesisHash={genesisHash}
      onClose={onClose}
      proxyTypeFilter={PROXY_TYPE.STAKING}
      setFlowStep={setFlowStep}
      showBack
      title={t('Settings')}
      transaction={tx}
      transactionInformation={transactionInformation}
    >
      <Content
        ED={ED}
        changeToStaked={changeToStaked}
        genesisHash={genesisHash}
        nextDisabled={nextDisabled}
        onNext={onNext}
        rewardDestinationAddress={rewardDestinationAddress}
        rewardDestinationType={rewardDestinationType}
        setRewardDestinationType={setRewardDestinationType}
        setSpecificAccount={setSpecificAccount}
        specificAccount={specificAccount}
      />
    </StakingPopup>
  );
}
