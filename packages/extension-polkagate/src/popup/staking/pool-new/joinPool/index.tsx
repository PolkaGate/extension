// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React, { useCallback, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Motion } from '../../../../components';
import { useBackground, usePools2, useSelectedAccount, useTransactionFlow, useTranslation } from '../../../../hooks';
import { UserDashboardHeader } from '../../../../partials';
import { useJoinPool } from '../../../../util/api/staking';
import JoinPoolBackButton from '../../partial/JoinPoolBackButton';
import { INITIAL_POOL_FILTER_STATE, poolFilterReducer } from '../../partial/PoolFilter';
import ChoosePool from './ChoosePool';
import JoinPoolInput from './JoinPoolInput';

export enum POOL_STEPS {
  CHOOSE_POOL = 1,
  CONFIG = 2,
  REVIEW = 3
}

export default function JoinPool () {
  useBackground('staking');

  const { t } = useTranslation();
  const selectedAccount = useSelectedAccount();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const navigate = useNavigate();
  const pools = usePools2(genesisHash);

  const { availableBalanceToStake,
    bondAmount,
    errorMessage,
    estimatedFee,
    onInputChange,
    onMaxValue,
    onMinValue,
    onSearch,
    searchedQuery,
    selectedPool,
    setBondAmount,
    setSelectedPool,
    transactionInformation,
    tx } = useJoinPool(selectedAccount?.address, genesisHash);

  const [filter, dispatchFilter] = useReducer(poolFilterReducer, INITIAL_POOL_FILTER_STATE);
  const [step, setStep] = useState(POOL_STEPS.CHOOSE_POOL);

  const onNext = useCallback(() => setStep(step + 1), [step]);
  const onBack = useCallback(() => {
    if (step > POOL_STEPS.CHOOSE_POOL) {
      setStep(step - 1);
      setBondAmount(undefined);
    } else {
      navigate('/pool/' + genesisHash + '/stake') as void;
    }
  }, [genesisHash, navigate, setBondAmount, step]);

  const transactionFlow = useTransactionFlow({
    address: selectedAccount?.address,
    backPathTitle: t('Joining Pool'),
    closeReview: onBack,
    genesisHash: genesisHash ?? '',
    pool: selectedPool,
    review: step === POOL_STEPS.REVIEW,
    stepCounter: { currentStep: 3, totalSteps: 3 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <Grid alignContent='flex-start' container sx={{ height: '100%', position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <Motion style={{ height: 'calc(100% - 50px)' }} variant='slide'>
        <JoinPoolBackButton
          dispatchFilter={dispatchFilter}
          filter={filter}
          genesisHash={genesisHash}
          noFilter={step === POOL_STEPS.CONFIG}
          onBack={onBack}
          onSearch={onSearch}
          stepCounter={{ currentStep: step === POOL_STEPS.CHOOSE_POOL ? 1 : 2, totalSteps: 3 }}
          style={{ mb: '15px' }}
        />
        {step === POOL_STEPS.CHOOSE_POOL &&
            <ChoosePool
              filter={filter}
              onNext={onNext}
              pools={pools}
              searchedQuery={searchedQuery}
              selectedPool={selectedPool}
              setSelectedPool={setSelectedPool}
            />
        }
        {step === POOL_STEPS.CONFIG &&
            <JoinPoolInput
              availableBalanceToStake={availableBalanceToStake}
              bondAmount={bondAmount}
              errorMessage={errorMessage}
              estimatedFee={estimatedFee}
              genesisHash={genesisHash}
              onBack={onBack}
              onInputChange={onInputChange}
              onMaxValue={onMaxValue}
              onMinValue={onMinValue}
              onNext={onNext}
              selectedPool={selectedPool}
            />
        }
      </Motion>
    </Grid>
  );
}
