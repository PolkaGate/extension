// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';
import type { Content } from '../../../../partials/Review';

import { Grid, Stack } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { BackWithLabel, Motion } from '../../../../components';
import { useBackground, useChainInfo, useEstimatedFee2, useFormatted3, useSelectedAccount, useSoloStakingInfo, useTransactionFlow, useTranslation } from '../../../../hooks';
import UserDashboardHeader from '../../../../partials/UserDashboardHeader';
import { amountToMachine } from '../../../../util/utils';
import FeeValue from '../../partial/FeeValue';
import StakeAmountInput from '../../partial/StakeAmountInput';
import StakingActionButton from '../../partial/StakingActionButton';
import TokenStakeStatus from '../../partial/TokenStakeStatus';

export default function BondExtra (): React.ReactElement {
  useBackground('staking');

  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const stakingInfo = useSoloStakingInfo(selectedAccount?.address, genesisHash);
  const { api, decimal, token } = useChainInfo(genesisHash);
  const formatted = useFormatted3(selectedAccount?.address, genesisHash);

  const bondExtra = api?.tx['staking']['bondExtra'];

  const [bondExtraValue, setBondExtraValue] = useState<BN | null | undefined>();
  const [review, setReview] = useState<boolean>(false);

  const estimatedFee2 = useEstimatedFee2(genesisHash ?? '', formatted, bondExtra, [bondExtraValue]);

  const staked = useMemo(() => stakingInfo.stakingAccount?.stakingLedger.active, [stakingInfo.stakingAccount?.stakingLedger.active]);
  const errorMessage = useMemo(() => {
    if (!bondExtraValue || bondExtraValue.isZero() || !stakingInfo.availableBalanceToStake || !api) {
      return undefined;
    }

    if (stakingInfo.availableBalanceToStake.isZero()) {
      return t('Not enough amount to stake more.');
    }

    if (bondExtraValue.gt(stakingInfo.availableBalanceToStake)) {
      return t('It is more than the available balance to stake.');
    }

    return undefined;
  }, [api, bondExtraValue, stakingInfo.availableBalanceToStake, t]);
  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: bondExtraValue,
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee2,
      title: t('Fee')
    },
    {
      content: staked && bondExtraValue ? (staked as unknown as BN).add(bondExtraValue) : undefined,
      title: t('Total Stake After'),
      withLogo: true
    }];
  }, [bondExtraValue, estimatedFee2, staked, t]);
  const tx = useMemo(() => bondExtra?.(bondExtraValue), [bondExtra, bondExtraValue]);

  const onInputChange = useCallback((value: string | null | undefined) => {
    const valueAsBN = value ? amountToMachine(value, decimal) : null;

    setBondExtraValue(valueAsBN);
  }, [decimal]);
  const onBack = useCallback(() => navigate('/solo/' + genesisHash) as void, [genesisHash, navigate]);
  const onMaxValue = useMemo(() => {
    if (!stakingInfo.availableBalanceToStake || !stakingInfo.stakingConsts?.existentialDeposit) {
      return '0';
    }

    return (stakingInfo.availableBalanceToStake.sub(stakingInfo.stakingConsts.existentialDeposit.muln(2))).toString(); // TO-DO: check if this is correct
  }, [stakingInfo.availableBalanceToStake, stakingInfo.stakingConsts?.existentialDeposit]);
  const onNext = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => {
    setReview(false);
    setBondExtraValue(undefined);
  }, []);

  const transactionFlow = useTransactionFlow({
    backPathTitle: t('Stake more'),
    closeReview,
    formatted,
    genesisHash: genesisHash ?? '',
    review,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' noSelection />
      <Motion variant='slide'>
        <BackWithLabel
          onClick={onBack}
          stepCounter={{ currentStep: 1, totalSteps: 2 }}
          style={{ pb: 0 }}
          text={t('Stake More')}
        />
        <Stack direction='column' justifyContent='space-between' sx={{ mt: '16px', mx: '15px' }}>
          <TokenStakeStatus
            amount={stakingInfo.availableBalanceToStake}
            decimal={decimal}
            genesisHash={genesisHash}
            style={{ mt: '8px' }}
            text={t('Available to stake')}
            token={token}
          />
          <StakeAmountInput
            buttonsArray={[{
              buttonName: t('Max'),
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
            disabled={!bondExtraValue || bondExtraValue.isZero() || !!errorMessage || !api}
            onClick={onNext}
            style={{ mt: '24px' }}
            text={t('Next')}
          />
        </Stack>
      </Motion>
    </Grid>
  );
}
