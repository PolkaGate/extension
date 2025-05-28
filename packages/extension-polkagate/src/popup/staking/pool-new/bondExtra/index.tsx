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
  const stakingInfo = usePoolStakingInfo(selectedAccount?.address, genesisHash);
  const { api, decimal, token } = useChainInfo(genesisHash);
  const formatted = useFormatted3(selectedAccount?.address, genesisHash);

  const bondExtra = api?.tx['nominationPools']['bondExtra'];

  const [bondAmount, setBondAmount] = useState<BN | null | undefined>();
  const [review, setReview] = useState<boolean>(false);

  const staked = useMemo(() => stakingInfo.pool === undefined ? undefined : new BN(stakingInfo.pool?.member?.points ?? 0), [stakingInfo.pool]);
  // const poolState = useMemo(() => String(stakingInfo.pool?.bondedPool?.state), [stakingInfo.pool?.bondedPool?.state]);

  const tx = useMemo(() => {
    if (!formatted || !bondExtra || !bondAmount) {
      return undefined;
    }

    return bondExtra({ FreeBalance: bondAmount });
  }, [bondAmount, bondExtra, formatted]);

  const estimatedFee2 = useEstimatedFee2(genesisHash ?? '', formatted, tx ?? bondExtra?.({ FreeBalance: bondAmount ?? BN_ONE }));

  const transactionInformation = useMemo(() => {
    return [{
      content: bondAmount,
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee2,
      title: t('Fee')
    },
    {
      content: bondAmount && staked ? (staked as unknown as BN).add(bondAmount) : undefined,
      title: t('Total stake after'),
      withLogo: true
    }];
  }, [bondAmount, estimatedFee2, staked, t]);

  const errorMessage = useMemo(() => {
    if (!bondAmount || !stakingInfo.availableBalanceToStake || !staked) {
      return undefined;
    }

    if (staked.isZero()) {
      return t('The account is fully unstaked, so can\'t stake until you withdraw entire unstaked/redeemable amount.');
    }

    if (stakingInfo.availableBalanceToStake.isZero()) {
      return t('Not enough amount to stake more.');
    }

    if (bondAmount.gt(stakingInfo.availableBalanceToStake ?? BN_ZERO)) {
      return t('It is more than the available balance to stake.');
    }

    return undefined;
  }, [bondAmount, staked, stakingInfo.availableBalanceToStake, t]);

  const onMaxValue = useMemo(() => {
    if (!stakingInfo.pool || !formatted || !stakingInfo.availableBalanceToStake || !stakingInfo.stakingConsts || !staked || staked.isZero()) {
      return '0';
    }

    return (stakingInfo.availableBalanceToStake.sub(stakingInfo.stakingConsts.existentialDeposit.muln(2))).toString(); // TO-DO: check if this is correct
  }, [formatted, staked, stakingInfo.availableBalanceToStake, stakingInfo.pool, stakingInfo.stakingConsts]);

  const onInputChange = useCallback((value: string | null | undefined) => {
    const valueAsBN = value ? amountToMachine(value, decimal) : null;

    setBondAmount(valueAsBN);
  }, [decimal]);

  const onNext = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => {
    setReview(false);
    setBondAmount(undefined);
  }, []);
  const onBack = useCallback(() => navigate('/pool/' + genesisHash) as void, [genesisHash, navigate]);

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
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader homeType='default' />
        <Motion variant='slide'>
          <BackWithLabel
            onClick={onBack}
            stepCounter={{ currentStep: 1, totalSteps: 2 }}
            style={{ pb: 0 }}
            text={t('Stake More')}
          />
          <Stack direction='column' justifyContent='space-between' sx={{ mt: '16px', px: '15px' }}>
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
              focused
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
              disabled={!bondAmount || bondAmount.isZero() || !!errorMessage || !api}
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
