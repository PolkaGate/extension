// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Stack } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { BackWithLabel, Motion } from '../../../../components';
import { useBackground, useChainInfo, useEstimatedFee2, useFormatted3, usePoolStakingInfo, useSelectedAccount, useTransactionFlow, useTranslation } from '../../../../hooks';
import UserDashboardHeader from '../../../../partials/UserDashboardHeader';
import { DATE_OPTIONS } from '../../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../../util/utils';
import FeeValue from '../../partial/FeeValue';
import StakeAmountInput from '../../partial/StakeAmountInput';
import StakingActionButton from '../../partial/StakingActionButton';
import TokenStakeStatus from '../../partial/TokenStakeStatus';

export default function Unstake (): React.ReactElement {
  useBackground('staking');

  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const stakingInfo = usePoolStakingInfo(selectedAccount?.address, genesisHash);
  const { api, decimal, token } = useChainInfo(genesisHash);
  const formatted = useFormatted3(selectedAccount?.address, genesisHash);

  const unbonded = api?.tx['nominationPools']['unbond'];
  const poolWithdrawUnbonded = api?.tx['nominationPools']['poolWithdrawUnbonded'];
  const batchAll = api?.tx['utility']['batchAll'];

  const [unstakingValue, setUnstakingValue] = useState<BN | null | undefined>();
  const [review, setReview] = useState<boolean>(false);

  const unlockingLen = stakingInfo.pool?.stashIdAccount?.stakingLedger?.unlocking?.length;
  const maxUnlockingChunks = api?.consts['staking']['maxUnlockingChunks'];

  const staked = useMemo(() => stakingInfo.pool === undefined ? undefined : new BN(stakingInfo.pool?.member?.points ?? 0), [stakingInfo.pool]);
  const isPoolOwner = useMemo(() =>
    String(formatted) === String(stakingInfo.pool?.bondedPool?.roles?.root) ||
    String(formatted) === String(stakingInfo.pool?.bondedPool?.roles?.depositor)
  , [formatted, stakingInfo.pool?.bondedPool?.roles?.depositor, stakingInfo.pool?.bondedPool?.roles?.root]);
  const poolState = useMemo(() => String(stakingInfo.pool?.bondedPool?.state), [stakingInfo.pool?.bondedPool?.state]);
  const poolMemberCounter = useMemo(() => Number(stakingInfo.pool?.bondedPool?.memberCounter), [stakingInfo.pool?.bondedPool?.memberCounter]);

  const redeemDate = useMemo(() => {
    if (stakingInfo.stakingConsts) {
      const date = Date.now() + stakingInfo.stakingConsts?.unbondingDuration * 24 * 60 * 60 * 1000;

      return new Date(date).toLocaleDateString(undefined, DATE_OPTIONS);
    }

    return undefined;
  }, [stakingInfo.stakingConsts]);

  const tx = useMemo(() => {
    if (unlockingLen === undefined || maxUnlockingChunks === undefined || !poolWithdrawUnbonded || !batchAll || !unbonded || !formatted) {
      return undefined;
    }

    const txs = [];

    if (unlockingLen >= Number(maxUnlockingChunks.toString())) {
      const dummyParams = [100];

      txs.push(poolWithdrawUnbonded(...dummyParams));
    }

    txs.push(unbonded(formatted, unstakingValue));

    return txs.length > 1 ? batchAll(txs) : txs[0];
  }, [batchAll, formatted, maxUnlockingChunks, poolWithdrawUnbonded, unbonded, unlockingLen, unstakingValue]);

  const estimatedFee2 = useEstimatedFee2(genesisHash ?? '', formatted, tx ?? unbonded?.(formatted ?? selectedAccount?.address ?? '', unstakingValue ?? BN_ONE));

  const transactionInformation = useMemo(() => {
    return [{
      content: unstakingValue,
      description: t('This amount will be redeemable on {{redeemDate}}, and your rewards will be automatically claimed.', { replace: { redeemDate } }),
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee2,
      title: t('Fee')
    },
    {
      content: unstakingValue && staked ? (staked as unknown as BN).sub(unstakingValue) : undefined,
      title: t('Total stake after'),
      withLogo: true
    }];
  }, [estimatedFee2, redeemDate, staked, t, unstakingValue]);

  const errorMessage = useMemo(() => {
    if (!unstakingValue || !stakingInfo.poolStakingConsts || !staked || !api) {
      return undefined;
    }

    // 1. Check if the user is trying to unstake more than they've staked
    if (unstakingValue.gt(staked ?? BN_ZERO)) {
      return t('It is more than already staked.');
    }

    // 2. If the user is the pool owner:
    // - and the pool is not in "Destroying" state
    // - and more than one member remains
    // - and the remaining stake after unstaking would be less than the minimum allowed to keep owning the pool
    if (isPoolOwner && (poolMemberCounter > 1 || poolState !== 'Destroying') && staked.sub(unstakingValue).lt(stakingInfo.poolStakingConsts.minCreateBond)) {
      const min = amountToHuman(stakingInfo.poolStakingConsts.minCreateBond, decimal ?? 0);

      return t('Remaining stake amount should not be less than {{min}} {{token}}', { replace: { min, token } });
    }

    // 3. If the user is NOT the pool owner:
    // - and they want to keep some stake (not full unstake)
    // - and the remaining stake would be less than the minimum required to stay in the pool
    if (!isPoolOwner && !staked.sub(unstakingValue).isZero() && staked.sub(unstakingValue).lt(stakingInfo.poolStakingConsts.minJoinBond)) {
      const remained = api.createType('Balance', staked.sub(unstakingValue)).toHuman();
      const min = api.createType('Balance', stakingInfo.poolStakingConsts.minJoinBond).toHuman();

      return t('Remaining stake amount ({{remained}}) should not be less than {{min}}.', { replace: { min, remained } });
    }

    return undefined;
  }, [api, decimal, isPoolOwner, poolMemberCounter, poolState, staked, stakingInfo.poolStakingConsts, t, token, unstakingValue]);

  const onMaxValue = useMemo(() => {
    if (!stakingInfo.pool || !formatted || !stakingInfo.poolStakingConsts || !staked || staked.isZero()) {
      return '0';
    }

    // Case 1: If user is the pool owner, the pool is being destroyed, and they're the last member
    // The user is able to unstake the full amount
    if (isPoolOwner && poolState === 'Destroying' && poolMemberCounter === 1) {
      return staked.toString();
    }

    // Case 2: If user is the pool owner, but the pool is still active or there are other members
    // They can only unstake down to the minimum required to keep the pool alive
    if (isPoolOwner && (poolState !== 'Destroying' || poolMemberCounter !== 1)) {
      const partial = staked.sub(stakingInfo.poolStakingConsts.minCreateBond);

      // If there's nothing above the minimum, return '0'
      return partial.isZero() ? '0' : partial.toString();
    }

    // Case 3: If user is NOT the pool owner, the user is able to unstake the full amount
    return staked.toString();
  }, [formatted, isPoolOwner, poolMemberCounter, poolState, staked, stakingInfo.pool, stakingInfo.poolStakingConsts]);

  const onInputChange = useCallback((value: string | null | undefined) => {
    const valueAsBN = value ? amountToMachine(value, decimal) : null;

    setUnstakingValue(valueAsBN);
  }, [decimal]);

  const onNext = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => {
    setReview(false);
    setUnstakingValue(undefined);
  }, []);
  const onBack = useCallback(() => navigate('/pool/' + genesisHash) as void, [genesisHash, navigate]);

  const transactionFlow = useTransactionFlow({
    backPathTitle: t('Unstaking'),
    closeReview,
    formatted,
    genesisHash: genesisHash ?? '',
    review,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader homeType='default' noSelection />
        <Motion variant='slide'>
          <BackWithLabel
            onClick={onBack}
            stepCounter={{ currentStep: 1, totalSteps: 2 }}
            style={{ pb: 0 }}
            text={t('Unstake')}
          />
          <Stack direction='column' justifyContent='space-between' sx={{ mt: '16px', px: '15px' }}>
            <TokenStakeStatus
              amount={staked as unknown as BN}
              decimal={decimal}
              genesisHash={genesisHash}
              style={{ mt: '8px' }}
              text={t('Staked')}
              token={token}
            />
            <StakeAmountInput
              buttonsArray={[{
                buttonName: t('All'),
                value: onMaxValue
              }]}
              decimal={decimal}
              errorMessage={errorMessage}
              onInputChange={onInputChange}
              style={{ mb: '18px', mt: '8px' }}
              title={t('Amount')}
              titleInColor={token?.toUpperCase()}
            />
            <FeeValue
              decimal={decimal}
              feeValue={estimatedFee2}
              token={token}
            />
            <StakingActionButton
              disabled={!unstakingValue || unstakingValue.isZero() || !!errorMessage || !api}
              onClick={onNext}
              style={{ marginTop: '24px' }}
              text={t('Next')}
            />
          </Stack>
        </Motion>
      </Grid>
    </>
  );
}
