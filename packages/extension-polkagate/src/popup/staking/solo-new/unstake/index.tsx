// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Stack } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { BackWithLabel, Motion } from '../../../../components';
import { useBackground, useChainInfo, useSelectedAccount, useTransactionFlow, useTranslation, useUnstakingSolo } from '../../../../hooks';
import UserDashboardHeader from '../../../../partials/UserDashboardHeader';
import { PROXY_TYPE } from '../../../../util/constants';
import FeeValue from '../../partial/FeeValue';
import StakeAmountInput from '../../partial/StakeAmountInput';
import StakingActionButton from '../../partial/StakingActionButton';
import TokenStakeStatus from '../../partial/TokenStakeStatus';

export default function Unstake (): React.ReactElement {
  useBackground('staking');

  const { t } = useTranslation();
  const navigate = useNavigate();
  const address = useSelectedAccount()?.address;
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const { api, decimal, token } = useChainInfo(genesisHash);

  const { errorMessage,
    estimatedFee,
    onInputChange,
    onMaxValue,
    setUnstakingValue,
    staked,
    transactionInformation,
    tx,
    unstakingValue } = useUnstakingSolo(address, genesisHash);

  const [review, setReview] = useState<boolean>(false);

  const onBack = useCallback(() => navigate('/solo/' + genesisHash) as void, [genesisHash, navigate]);
  const onNext = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => {
    setReview(false);
    setUnstakingValue(undefined);
  }, [setUnstakingValue]);

  const transactionFlow = useTransactionFlow({
    address,
    backPathTitle: t('Unstaking'),
    closeReview,
    genesisHash: genesisHash ?? '',
    proxyTypeFilter: PROXY_TYPE.STAKING,
    review,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
      <UserDashboardHeader fullscreenURL={'/fullscreen-stake/solo/' + address + '/' + genesisHash} homeType='default' />
      <Motion variant='slide'>
        <BackWithLabel
          onClick={onBack}
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
              buttonName: t('Max'),
              value: onMaxValue
            }]}
            decimal={decimal}
            errorMessage={errorMessage}
            focused
            onInputChange={onInputChange}
            style={{ my: '18px' }}
            title={t('Amount') + ` (${token?.toUpperCase() ?? '--'})`}
            titleInColor={` (${token?.toUpperCase() ?? '--'})`}
          />
          <FeeValue
            decimal={decimal}
            feeValue={estimatedFee}
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
  );
}
