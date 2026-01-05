// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';

import { useTranslation, useWithdrawPool } from '../../../../hooks';
import { PROXY_TYPE } from '../../../../util/constants';
import StakingPopup from '../../partials/StakingPopup';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow } from '../../util/utils';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  onClose: () => void;
}

export default function Withdraw ({ address, genesisHash, onClose }: Props): React.ReactElement {
  const { t } = useTranslation();

  const { transactionInformation, tx } = useWithdrawPool(address, genesisHash);

  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.REVIEW);

  return (
    <StakingPopup
      address={address}
      flowStep={flowStep}
      genesisHash={genesisHash}
      onClose={onClose}
      proxyTypeFilter={PROXY_TYPE.NOMINATION_POOLS}
      setFlowStep={setFlowStep}
      showBack
      title={t('Redeemable')}
      transaction={tx}
      transactionInformation={transactionInformation}
    />
  );
}
