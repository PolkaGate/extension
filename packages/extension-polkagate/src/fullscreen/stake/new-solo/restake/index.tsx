// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { useRestakeSolo, useTranslation } from '../../../../hooks';
import StakeUnstake from '../unstake/StakeUnstake';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  onClose: () => void;
}

function Restake ({ address, genesisHash, onClose }: Props) {
  const { t } = useTranslation();

  const { errorMessage,
    estimatedFee,
    onInputChange,
    onMaxValue,
    rebondValue,
    setRebondValue,
    transactionInformation,
    tx,
    unlockingAmount } = useRestakeSolo(address, genesisHash);

  return (
    <StakeUnstake
      address={address}
      amountLabel={t('Unstaking')}
      balance={unlockingAmount}
      errorMessage={errorMessage}
      estimatedFee={estimatedFee}
      genesisHash={genesisHash}
      onClose={onClose}
      onInputChange={onInputChange}
      onMaxValue={onMaxValue}
      setValue={setRebondValue}
      title={t('Restake')}
      transactionInformation={transactionInformation}
      tx={tx}
      value={rebondValue}
    />
  );
}

export default React.memo(Restake);
