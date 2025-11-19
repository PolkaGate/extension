// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { Content } from '../../../../partials/Review';
import type { PoolInfo } from '../../../../util/types';

import { Stack } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { type BN } from '@polkadot/util';

import { GradientButton } from '../../../../components';
import { useChainInfo, useTranslation } from '../../../../hooks';
import FeeValue from '../../../../popup/staking/partial/FeeValue';
import SelectedPool from '../../../../popup/staking/partial/SelectedPool';
import StakeAmountInput from '../../../../popup/staking/partial/StakeAmountInput';
import TokenStakeStatus from '../../../../popup/staking/partial/TokenStakeStatus';
import { PROXY_TYPE } from '../../../../util/constants';
import StakingPopup from '../../partials/StakingPopup';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow } from '../../util/utils';

interface Props {
  selectedPool: PoolInfo | undefined;
  onBack: () => void;
  genesisHash: string | undefined;
  errorMessage: string | undefined;
  estimatedFee: Balance | undefined | null;
  availableBalanceToStake: BN | undefined;
  bondAmount: BN | undefined;
  onInputChange: (value: string | null | undefined) => void;
  onMaxValue: string;
  onMinValue: string;
  address: string | undefined;
  setBondAmount: React.Dispatch<React.SetStateAction<BN | undefined>>;
  tx: SubmittableExtrinsic<'promise', ISubmittableResult> | undefined;
  transactionInformation: Content[];
}

export default function JoinPoolInput ({ address, availableBalanceToStake, bondAmount, errorMessage, estimatedFee, genesisHash, onBack, onInputChange, onMaxValue, onMinValue, selectedPool, setBondAmount, transactionInformation, tx }: Props): React.ReactNode {
  const { t } = useTranslation();
  const { api, decimal, token } = useChainInfo(genesisHash);

  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.NONE);

  const onNext = useCallback(() => setFlowStep?.(FULLSCREEN_STAKING_TX_FLOW.REVIEW), [setFlowStep]);

  return (
    <StakingPopup
      address={address}
      flowStep={flowStep}
      genesisHash={genesisHash}
      onClose={onBack}
      proxyTypeFilter={PROXY_TYPE.NOMINATION_POOLS}
      setFlowStep={setFlowStep}
      setValue={setBondAmount as React.Dispatch<React.SetStateAction<BN | null | undefined>>}
      title={t('Stake more')}
      transaction={tx}
      transactionInformation={transactionInformation}
    >
      <Stack direction='column' sx={{ gap: '8px', position: 'relative', px: '15px', width: '100%', zIndex: 1 }}>
        <TokenStakeStatus
          amount={availableBalanceToStake}
          decimal={decimal}
          genesisHash={genesisHash}
          style={{ mt: '8px' }}
          text={t('Available to Stake')}
          token={token}
        />
        <SelectedPool
          onClick={onBack}
          selectedPool={selectedPool}
          text={t('Selected Pool')}
        />
        <StakeAmountInput
          buttonsArray={[{
            buttonName: t('Max'),
            value: onMaxValue
          }, {
            buttonName: t('Min'),
            value: onMinValue
          }]}
          decimal={decimal}
          errorMessage={errorMessage}
          focused
          onInputChange={onInputChange}
          title={t('Amount') + ` (${token?.toUpperCase() ?? '--'})`}
          titleInColor={` (${token?.toUpperCase() ?? '--'})`}
        />
        <FeeValue
          decimal={decimal}
          feeValue={estimatedFee}
          token={token}
        />
        <GradientButton
          disabled={!bondAmount || bondAmount.isZero() || !!errorMessage || !api}
          onClick={onNext}
          style={{ marginTop: '165px' }}
          text={t('Next')}
        />
      </Stack>
    </StakingPopup>
  );
}
