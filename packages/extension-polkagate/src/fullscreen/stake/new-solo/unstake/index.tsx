// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { useTranslation, useUnstakingSolo } from '../../../../hooks';
import StakeUnstake from './StakeUnstake';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  onClose: () => void;
}

function Unstake ({ address, genesisHash, onClose }: Props) {
  const { t } = useTranslation();

  const { errorMessage,
    estimatedFee,
    onInputChange,
    onMaxValue,
    setUnstakingValue,
    staked,
    transactionInformation,
    tx,
    unstakingValue } = useUnstakingSolo(address, genesisHash);

  return (
    <StakeUnstake
      address={address}
      amountLabel={t('Staked')}
      balance={staked}
      errorMessage={errorMessage}
      estimatedFee={estimatedFee}
      genesisHash={genesisHash}
      onClose={onClose}
      onInputChange={onInputChange}
      onMaxValue={onMaxValue}
      setValue={setUnstakingValue}
      title={t('Unstake')}
      transactionInformation={transactionInformation}
      tx={tx}
      value={unstakingValue}
    />
  );
}

export default React.memo(Unstake);
