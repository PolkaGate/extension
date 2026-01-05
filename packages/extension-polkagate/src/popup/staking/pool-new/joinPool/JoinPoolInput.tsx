// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';
import type { PoolInfo } from '../../../../util/types';

import { Stack } from '@mui/material';
import React from 'react';

import { type BN } from '@polkadot/util';

import { useChainInfo, useTranslation } from '../../../../hooks';
import FeeValue from '../../partial/FeeValue';
import SelectedPool from '../../partial/SelectedPool';
import StakeAmountInput from '../../partial/StakeAmountInput';
import StakingActionButton from '../../partial/StakingActionButton';
import TokenStakeStatus from '../../partial/TokenStakeStatus';

interface Props {
  selectedPool: PoolInfo | undefined;
  onNext: () => void;
  onBack: () => void;
  genesisHash: string | undefined;
  errorMessage: string | undefined;
  estimatedFee: Balance | undefined | null;
  availableBalanceToStake: BN | undefined;
  bondAmount: BN | undefined;
  onInputChange: (value: string | null | undefined) => void;
  onMaxValue: string;
  onMinValue: string;
}

export default function JoinPoolInput ({ availableBalanceToStake, bondAmount, errorMessage, estimatedFee, genesisHash, onBack, onInputChange, onMaxValue, onMinValue, onNext, selectedPool }: Props): React.ReactNode {
  const { t } = useTranslation();
  const { api, decimal, token } = useChainInfo(genesisHash);

  return (
    <Stack direction='column' sx={{ gap: '8px', px: '15px', width: '100%' }}>
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
      <StakingActionButton
        disabled={!bondAmount || bondAmount.isZero() || !!errorMessage || !api}
        onClick={onNext}
        style={{ bottom: '15px', position: 'absolute', width: '345px' }}
        text={t('Next')}
      />
    </Stack>
  );
}
