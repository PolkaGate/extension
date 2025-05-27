// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';
import type { PoolStakingInfo } from '../../../../hooks/usePoolStakingInfo';
import type { PoolInfo } from '../../../../util/types';

import { Stack } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { type BN, BN_ZERO } from '@polkadot/util';

import { useChainInfo, useTranslation } from '../../../../hooks';
import { amountToMachine } from '../../../../util/utils';
import ChosePool from '../../partial/ChosePool';
import FeeValue from '../../partial/FeeValue';
import StakeAmountInput from '../../partial/StakeAmountInput';
import StakingActionButton from '../../partial/StakingActionButton';
import TokenStakeStatus from '../../partial/TokenStakeStatus';

interface Props {
  selectedPool: PoolInfo | undefined;
  onNext: () => void;
  onBack: () => void;
  genesisHash: string | undefined;
  errorMessage: string | undefined;
  estimatedFee2: Balance | undefined;
  stakingInfo: PoolStakingInfo;
  formatted: string | undefined;
  setBondAmount: React.Dispatch<React.SetStateAction<BN>>;
  bondAmount: BN;
}

export default function JoinPoolInput ({ bondAmount, errorMessage, estimatedFee2, formatted, genesisHash, onBack, onNext, selectedPool, setBondAmount, stakingInfo }: Props): React.ReactNode {
  const { t } = useTranslation();
  const { api, decimal, token } = useChainInfo(genesisHash);

  const onMaxValue = useMemo(() => {
    if (!formatted || !stakingInfo.availableBalanceToStake || !stakingInfo.stakingConsts) {
      return '0';
    }

    return (stakingInfo.availableBalanceToStake.sub(stakingInfo.stakingConsts.existentialDeposit.muln(2))).toString(); // TO-DO: check if this is correct
  }, [formatted, stakingInfo.availableBalanceToStake, stakingInfo.stakingConsts]);

  const onMinValue = useMemo(() => {
    if (!stakingInfo.poolStakingConsts) {
      return '0';
    }

    return stakingInfo.poolStakingConsts?.minJoinBond.toString();
  }, [stakingInfo.poolStakingConsts]);

  const onInputChange = useCallback((value: string | null | undefined) => {
    const valueAsBN = value ? amountToMachine(value, decimal) : BN_ZERO;

    setBondAmount(valueAsBN);
  }, [decimal, setBondAmount]);

  return (
    <Stack direction='column' sx={{ gap: '8px', px: '15px', width: '100%' }}>
      <TokenStakeStatus
        amount={stakingInfo.availableBalanceToStake}
        decimal={decimal}
        genesisHash={genesisHash}
        style={{ mt: '8px' }}
        text={t('Available to stake')}
        token={token}
      />
      <ChosePool
        onClick={onBack}
        poolName={selectedPool?.metadata ?? ''}
        poolStashAddress={selectedPool?.stashIdAccount?.accountId.toString()}
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
        feeValue={estimatedFee2}
        token={token}
      />
      <StakingActionButton
        disabled={!bondAmount || bondAmount.isZero() || !!errorMessage || !api}
        onClick={onNext}
        style={{ marginTop: '24px' }}
        text={t('Next')}
      />
    </Stack>
  );
}
