// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Stack } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { type BN, BN_ONE } from '@polkadot/util';

import { BackWithLabel, Motion } from '../../../../components';
import { useBackground, useChainInfo, useEstimatedFee2, useFormatted3, useSelectedAccount, useSoloStakingInfo, useTransactionFlow, useTranslation } from '../../../../hooks';
import UserDashboardHeader from '../../../../partials/UserDashboardHeader';
import { amountToMachine } from '../../../../util/utils';
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
  const stakingInfo = useSoloStakingInfo(selectedAccount?.address, genesisHash);
  const { api, decimal, token } = useChainInfo(genesisHash);
  const formatted = useFormatted3(selectedAccount?.address, genesisHash);

  const unbonded = api?.tx['staking']['unbond'];
  const redeem = api?.tx['staking']['withdrawUnbonded'];
  const chill = api?.tx['staking']['chill'];
  const batchAll = api?.tx['utility']['batchAll'];

  const [unstakingValue, setUnstakingValue] = useState<BN | null | undefined>();
  const [review, setReview] = useState<boolean>(false);

  const staked = useMemo(() => stakingInfo.stakingAccount?.stakingLedger.active as unknown as BN | undefined, [stakingInfo.stakingAccount?.stakingLedger.active]);
  const isStopStaking = useMemo(() => Boolean(unstakingValue && staked && unstakingValue.eq(staked)), [staked, unstakingValue]);

  const unlockingLen = stakingInfo.stakingAccount?.stakingLedger?.unlocking?.length;

  const maxUnlockingChunks = api?.consts['staking']['maxUnlockingChunks'];

  const tx = useMemo(() => {
    if (unlockingLen === undefined || maxUnlockingChunks === undefined || !chill || !redeem || !batchAll || !unbonded) {
      return undefined;
    }

    const txs = [];

    if (isStopStaking) {
      txs.push(chill());
    }

    if (unlockingLen >= Number(maxUnlockingChunks.toString())) {
      const dummyParams = [100];

      txs.push(redeem(...dummyParams));
    }

    txs.push(unbonded(unstakingValue));

    return txs.length > 1 ? batchAll(txs) : txs[0];
  }, [batchAll, chill, isStopStaking, maxUnlockingChunks, redeem, unbonded, unlockingLen, unstakingValue]);

  const estimatedFee2 = useEstimatedFee2(genesisHash ?? '', formatted, tx ?? unbonded?.(unstakingValue ?? BN_ONE));

  const errorMessage = useMemo(() => {
    if (!unstakingValue || unstakingValue.isZero() || !staked || !api) {
      return undefined;
    }

    if (unstakingValue.gt(staked)) {
      return t('It is more than already staked.');
    }

    if (stakingInfo.stakingConsts && !staked.sub(unstakingValue).isZero() && !isStopStaking && staked.sub(unstakingValue).lt(stakingInfo.stakingConsts.minNominatorBond)) {
      const remained = api.createType('Balance', staked.sub(unstakingValue)).toHuman();
      const min = api.createType('Balance', stakingInfo.stakingConsts.minNominatorBond).toHuman();

      return t('Remaining stake amount ({{remained}}) should not be less than {{min}}.', { replace: { min, remained } });
    }

    return undefined;
  }, [api, isStopStaking, staked, stakingInfo.stakingConsts, t, unstakingValue]);

  const transactionInformation = useMemo(() => {
    return [{
      content: unstakingValue,
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee2,
      title: t('Fee')
    },
    {
      content: unstakingValue && staked ? (staked).sub(unstakingValue) : undefined,
      title: t('Total stake after'),
      withLogo: true
    }];
  }, [estimatedFee2, staked, t, unstakingValue]);

  const onInputChange = useCallback((value: string | null | undefined) => {
    const valueAsBN = value ? amountToMachine(value, decimal) : null;

    setUnstakingValue(valueAsBN);
  }, [decimal]);
  const onBack = useCallback(() => navigate('/solo/' + genesisHash) as void, [genesisHash, navigate]);
  const onMaxValue = useMemo(() => {
    if (!staked || !decimal) {
      return '0';
    }

    return staked.toString();
  }, [decimal, staked]);
  const onNext = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => setReview(false), []);

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
            staking
            stepCounter={{ currentStep: 1, totalSteps: 2 }}
            style={{ pb: 0 }}
            text={t('Unstake')}
          />
          <Stack direction='column' justifyContent='space-between' sx={{ mt: '16px', px: '15px' }}>
            <TokenStakeStatus
              amount={staked}
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
              title={t('Amount') + ` (${token?.toUpperCase() ?? '--'})`}
              titleInColor={` (${token?.toUpperCase() ?? '--'})`}
            />
            <FeeValue
              decimal={decimal}
              feeValue={estimatedFee2}
              token={token}
            />
            <StakingActionButton
              disabled={!unstakingValue || unstakingValue.isZero() || !!errorMessage || !api}
              onClick={onNext}
              style={{ mt: '24px' }}
              text={t('Next')}
            />
          </Stack>
        </Motion>
      </Grid>
    </>
  );
}
