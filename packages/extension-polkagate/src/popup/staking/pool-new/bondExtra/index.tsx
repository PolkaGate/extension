// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Stack } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BackWithLabel, Motion } from '../../../../components';
import { useBackground, useBondExtraPool, useChainInfo, usePoolStakingInfo, useSelectedAccount, useTransactionFlow, useTranslation } from '../../../../hooks';
import UserDashboardHeader from '../../../../partials/UserDashboardHeader';
import { PROXY_TYPE } from '../../../../util/constants';
import FeeValue from '../../partial/FeeValue';
import StakeAmountInput from '../../partial/StakeAmountInput';
import StakingActionButton from '../../partial/StakingActionButton';
import TokenStakeStatus from '../../partial/TokenStakeStatus';

export default function BondExtra (): React.ReactElement {
  useBackground('staking');

  const { t } = useTranslation();
  const navigate = useNavigate();
  const address = useSelectedAccount()?.address;
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const stakingInfo = usePoolStakingInfo(address, genesisHash);
  const { api, decimal, token } = useChainInfo(genesisHash);

  const [review, setReview] = useState<boolean>(false);

  const { bondAmount,
    errorMessage,
    estimatedFee,
    onInputChange,
    onMaxValue,
    setBondAmount,
    transactionInformation,
    tx } = useBondExtraPool(address, genesisHash);

  const onNext = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => {
    setReview(false);
    setBondAmount(undefined);
  }, [setBondAmount]);
  const onBack = useCallback(() => navigate('/pool/' + genesisHash) as void, [genesisHash, navigate]);

  const transactionFlow = useTransactionFlow({
    address,
    backPathTitle: t('Stake more'),
    closeReview,
    genesisHash: genesisHash ?? '',
    proxyTypeFilter: PROXY_TYPE.NOMINATION_POOLS,
    review,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader fullscreenURL={'/fullscreen-stake/pool/' + address + '/' + genesisHash} homeType='default' />
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
              text={t('Available to Stake')}
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
              feeValue={estimatedFee}
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
