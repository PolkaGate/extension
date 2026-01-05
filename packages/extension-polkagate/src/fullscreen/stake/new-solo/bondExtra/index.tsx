// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { t } from 'i18next';
import React from 'react';

import { useBondExtraSolo } from '../../../../hooks';
import StakeUnstake from '../unstake/StakeUnstake';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  onClose: () => void;
}

export default function BondExtra ({ address, genesisHash, onClose }: Props) {
  const { availableBalanceToStake,
    bondExtraValue,
    errorMessage,
    estimatedFee,
    onInputChange,
    onMaxValue,
    setBondExtraValue,
    transactionInformation,
    tx } = useBondExtraSolo(address, genesisHash);

  return (
    <StakeUnstake
      address={address}
      amountLabel={t('Available to Stake')}
      balance={availableBalanceToStake}
      errorMessage={errorMessage}
      estimatedFee={estimatedFee}
      genesisHash={genesisHash}
      onClose={onClose}
      onInputChange={onInputChange}
      onMaxValue={onMaxValue}
      setValue={setBondExtraValue}
      title={t('Stake more')}
      transactionInformation={transactionInformation}
      tx={tx}
      value={bondExtraValue}
    />
  );
}
