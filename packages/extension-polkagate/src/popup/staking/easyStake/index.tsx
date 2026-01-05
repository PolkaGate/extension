// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import EasyStakeReviewHeader from '../../../fullscreen/stake/easyStake/partials/EasyStakeReviewHeader';
import { EasyStakeSide } from '../../../fullscreen/stake/util/utils';
import { useBackground, useChainInfo, useEasyStake, useSelectedAccount, useTransactionFlow, useTranslation } from '../../../hooks';
import { UserDashboardHeader } from '../../../partials';
import { PROXY_TYPE } from '../../../util/constants';
import { fetchStaking } from '../../../util/fetchStaking';
import InputPage from './InputPage';
import SelectPool from './SelectPool';
import SelectValidator from './SelectValidator';
import StakingTypeSelection from './StakingTypeSelection';

export default function EasyStake () {
  useBackground('staking');

  const { t } = useTranslation();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const { chainName, token } = useChainInfo(genesisHash, true);
  const address = useSelectedAccount()?.address;

  const [rate, setRate] = useState<number | undefined>(undefined);
  const [suggestedValidators, setSuggestedValidators] = useState<string[] | undefined>(undefined);
  const [review, setReview] = useState<boolean>(false);

  useEffect(() => {
    fetchStaking().then((res) => {
      setRate((res?.rates as unknown as Record<string, number> | undefined)?.[chainName?.toLowerCase() ?? ''] || 0);
      setSuggestedValidators((res?.validators as unknown as Record<string, string[]> | undefined)?.[chainName?.toLowerCase() ?? ''] || []);
    }).catch(console.error);
  }, [chainName]);

  const { amount,
    amountAsBN,
    availableBalanceToStake,
    buttonDisable,
    errorMessage,
    initialPool,
    onChangeAmount,
    onMaxMinAmount,
    selectedStakingType,
    setAmount,
    setSelectedStakingType,
    setSide,
    side,
    stakingConsts,
    transactionInformation,
    tx } = useEasyStake(address, genesisHash);

  const openReview = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => {
    setReview(false);
    setAmount(undefined);
  }, [setAmount]);

  const transactionFlow = useTransactionFlow({
    address,
    backPathTitle: t('Stake {{token}}', { replace: { token } }),
    closeReview,
    extraDetailConfirmationPage: { amount: amountAsBN?.toString(), extra: { easyStakingType: selectedStakingType?.type ?? '' } }, // Used in confirmation page to return to the correct staking home page (pool/solo)
    genesisHash: genesisHash ?? '',
    proxyTypeFilter: selectedStakingType?.type === 'pool' ? PROXY_TYPE.NOMINATION_POOLS : PROXY_TYPE.STAKING,
    review,
    reviewHeader:
      <EasyStakeReviewHeader
        amount={amountAsBN?.toString()}
        genesisHash={genesisHash}
        isExtension
        token={token}
      />,
    showAccountBox: false,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      {side === EasyStakeSide.INPUT &&
        <InputPage
          amount={amount}
          availableBalanceToStake={availableBalanceToStake}
          buttonDisabled={!!buttonDisable}
          errorMessage={errorMessage}
          genesisHash={genesisHash}
          loading={!initialPool}
          onChangeAmount={onChangeAmount}
          onMaxMinAmount={onMaxMinAmount}
          openReview={openReview}
          rate={rate}
          selectedStakingType={selectedStakingType}
          setSide={setSide}
          stakingConsts={stakingConsts}
        />
      }
      {side === EasyStakeSide.STAKING_TYPE &&
        <StakingTypeSelection
          genesisHash={genesisHash}
          initialPool={initialPool}
          selectedStakingType={selectedStakingType}
          setSelectedStakingType={setSelectedStakingType}
          setSide={setSide}
          suggestedValidators={suggestedValidators}
        />
      }
      {side === EasyStakeSide.SELECT_POOL &&
        <SelectPool
          genesisHash={genesisHash}
          selectedStakingType={selectedStakingType}
          setSelectedStakingType={setSelectedStakingType}
          setSide={setSide}
        />
      }
      {side === EasyStakeSide.SELECT_VALIDATORS &&
        <SelectValidator
          genesisHash={genesisHash}
          selectedStakingType={selectedStakingType}
          setSelectedStakingType={setSelectedStakingType}
          setSide={setSide}
          suggestedValidators={suggestedValidators}
        />
      }
    </Grid>
  );
}
