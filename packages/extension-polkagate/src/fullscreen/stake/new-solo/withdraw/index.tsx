// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';

import { useTranslation, useWithdrawSolo } from '../../../../hooks';
import StakingPopup from '../../partials/StakingPopup';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow } from '../../util/utils';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  onClose: () => void;
}

export default function Withdraw ({ address, genesisHash, onClose }: Props): React.ReactElement {
  const { t } = useTranslation();

  const { transactionInformation, tx } = useWithdrawSolo(address, genesisHash, true);

  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.REVIEW);

  return (
    <StakingPopup
      address={address}
      flowStep={flowStep}
      genesisHash={genesisHash}
      onClose={onClose}
      setFlowStep={setFlowStep}
      title={t('Withdraw redeemable')}
      transaction={tx}
      transactionInformation={transactionInformation}
    />
  );
}
