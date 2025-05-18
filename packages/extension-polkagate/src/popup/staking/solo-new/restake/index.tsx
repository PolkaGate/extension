// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';

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

export default function Restake (): React.ReactElement {
  useBackground('staking');

  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const stakingInfo = useSoloStakingInfo(selectedAccount?.address, genesisHash);
  const { api, decimal, token } = useChainInfo(genesisHash);
  const formatted = useFormatted3(selectedAccount?.address, genesisHash);

  const rebond = api?.tx['staking']['rebond'];

  const [rebondValue, setRebondValue] = useState<BN | null | undefined>();
  const [review, setReview] = useState<boolean>(false);

  const estimatedFee2 = useEstimatedFee2(genesisHash ?? '', formatted, rebond, [rebondValue]);

  const staked = useMemo(() => stakingInfo.stakingAccount?.stakingLedger.active, [stakingInfo.stakingAccount?.stakingLedger.active]);
  const unlockingAmount = useMemo(() => stakingInfo.sessionInfo?.unlockingAmount, [stakingInfo.sessionInfo?.unlockingAmount]);
  const errorMessage = useMemo(() => {
    if (!unlockingAmount || unlockingAmount.isZero() || !rebondValue || rebondValue.isZero() || !api) {
      return undefined;
    }

    if (rebondValue.gt(unlockingAmount)) {
      return t('It is more than unstaking amount.');
    }

    return undefined;
  }, [api, rebondValue, t, unlockingAmount]);
  const transactionInformation = useMemo(() => {
    return [{
      content: rebondValue,
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee2,
      title: t('Fee')
    },
    {
      content: rebondValue && staked ? (staked as unknown as BN).add(rebondValue) : undefined,
      title: t('Total stake after'),
      withLogo: true
    }
    ];
  }, [estimatedFee2, rebondValue, staked, t]);
  const tx = useMemo(() => rebond?.(rebondValue), [rebond, rebondValue]);

  const onInputChange = useCallback((value: string | null | undefined) => {
    const valueAsBN = value ? amountToMachine(value, decimal) : null;

    setRebondValue(valueAsBN);
  }, [decimal]);
  const onBack = useCallback(() => navigate('/solo/' + genesisHash) as void, [genesisHash, navigate]);
  const onMaxValue = useMemo(() => {
    if (!unlockingAmount || !decimal) {
      return '0';
    }

    return unlockingAmount.toString();
  }, [decimal, unlockingAmount]);
  const onNext = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => {
    setReview(false);
    setRebondValue(undefined);
  }, []);

  const transactionFlow = useTransactionFlow({
    backPathTitle: t('Restaking'),
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
            text={t('Restake')}
          />
          <Stack direction='column' justifyContent='space-between' sx={{ mt: '16px', mx: '15px' }}>
            <TokenStakeStatus
              amount={unlockingAmount}
              decimal={decimal}
              genesisHash={genesisHash}
              style={{ mt: '8px' }}
              text={t('Unstaking')}
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
              disabled={!rebondValue || rebondValue.isZero() || !!errorMessage || !api}
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
