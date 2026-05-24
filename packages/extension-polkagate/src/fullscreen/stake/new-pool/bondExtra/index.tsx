// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { useBondExtraPool, useTranslation } from '../../../../hooks';
import StakeUnstake from '../../new-solo/unstake/StakeUnstake';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  onClose: () => void;
}

export default function BondExtra({ address, genesisHash, onClose }: Props): React.ReactElement {
  const { t } = useTranslation();

  const { availableBalanceToStake,
    bondAmount,
    errorMessage,
    estimatedFee,
    onInputChange,
    onMaxValue,
    setBondAmount,
    transactionInformation,
    tx } = useBondExtraPool(address, genesisHash);

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
      setValue={setBondAmount}
      title={t('Stake more')}
      transactionInformation={transactionInformation}
      tx={tx}
      value={bondAmount}
    />
  );
}
