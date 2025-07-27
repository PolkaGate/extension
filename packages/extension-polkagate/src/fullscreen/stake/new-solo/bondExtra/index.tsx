// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { GradientButton } from '../../../../components';
import { useBondExtraSolo, useChainInfo, useTranslation } from '../../../../hooks';
import FeeValue from '../../../../popup/staking/partial/FeeValue';
import StakeAmountInput from '../../../../popup/staking/partial/StakeAmountInput';
import TokenStakeStatus from '../../../../popup/staking/partial/TokenStakeStatus';
import StakingPopup from '../../partials/StakingPopup';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow } from '../../util/utils';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  onClose: () => void;
}

export default function BondExtra ({ address, genesisHash, onClose }: Props) {
  const { t } = useTranslation();
  const { api, decimal, token } = useChainInfo(genesisHash);

  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.NONE);

  const { availableBalanceToStake,
    bondExtraValue,
    errorMessage,
    estimatedFee,
    onInputChange,
    onMaxValue,
    setBondExtraValue,
    transactionInformation,
    tx } = useBondExtraSolo(address, genesisHash);

  const onNext = useCallback(() => setFlowStep?.(FULLSCREEN_STAKING_TX_FLOW.REVIEW), [setFlowStep]);

  return (
    <StakingPopup
      address={address}
      flowStep={flowStep}
      genesisHash={genesisHash}
      onClose={onClose}
      setFlowStep={setFlowStep}
      setValue={setBondExtraValue}
      title={t('Stake more')}
      transaction={tx}
      transactionInformation={transactionInformation}
    >
      <Stack direction='column' justifyContent='space-between' sx={{ mt: '16px', position: 'relative', px: '15px', zIndex: 1 }}>
        <TokenStakeStatus
          amount={availableBalanceToStake}
          decimal={decimal}
          genesisHash={genesisHash}
          style={{ mt: '8px' }}
          text={t('Staked')}
          token={token}
        />
        <StakeAmountInput
          buttonsArray={[{
            buttonName: t('Max'),
            value: onMaxValue
          }]}
          decimal={decimal}
          errorMessage={errorMessage}
          focused
          onInputChange={onInputChange}
          style={{ mb: '18px', mt: '18px' }}
          title={t('Amount') + ` (${token?.toUpperCase() ?? '--'})`}
          titleInColor={` (${token?.toUpperCase() ?? '--'})`}
        />
        <FeeValue
          decimal={decimal}
          feeValue={estimatedFee}
          token={token}
        />
        <GradientButton
          disabled={!bondExtraValue || bondExtraValue.isZero() || !!errorMessage || !api}
          onClick={onNext}
          style={{ marginTop: '215px' }}
          text={t('Next')}
        />
      </Stack>
    </StakingPopup>
  );
}
