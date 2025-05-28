// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '../../../../util/types';

import { Grid } from '@mui/material';
import React, { useCallback, useMemo, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { type BN, BN_ZERO } from '@polkadot/util';

import { Motion } from '../../../../components';
import { useBackground, useChainInfo, useEstimatedFee2, useFormatted3, usePools2, usePoolStakingInfo, useSelectedAccount, useTransactionFlow, useTranslation } from '../../../../hooks';
import { UserDashboardHeader } from '../../../../partials';
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
  const { api } = useChainInfo(genesisHash);
  const formatted = useFormatted3(selectedAccount?.address, genesisHash);
  const stakingInfo = usePoolStakingInfo(selectedAccount?.address, genesisHash);
  const pools = usePools2(genesisHash);

  const join = api?.tx['nominationPools']['join']; // (amount, poolId)

  const [searchedQuery, setSearchedQuery] = useState<string>('');
  const [filter, dispatchFilter] = useReducer(poolFilterReducer, INITIAL_POOL_FILTER_STATE);
  const [step, setStep] = useState(POOL_STEPS.CHOOSE_POOL);
  const [selectedPool, setSelectedPool] = useState<PoolInfo | undefined>(undefined);
  const [bondAmount, setBondAmount] = useState<BN>(BN_ZERO);

  const tx = useMemo(() => {
    if (!join || !bondAmount || !selectedPool) {
      return undefined;
    }

    return join(bondAmount, selectedPool.poolId);
  }, [bondAmount, join, selectedPool]);

  const estimatedFee2 = useEstimatedFee2(genesisHash ?? '', formatted, tx ?? join?.(bondAmount, selectedPool?.poolId ?? 0));

  const transactionInformation = useMemo(() => {
    return [{
      content: bondAmount,
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee2,
      title: t('Fee')
    }];
  }, [bondAmount, estimatedFee2, t]);

  const errorMessage = useMemo(() => {
    if (!bondAmount || !stakingInfo.availableBalanceToStake) {
      return undefined;
    }

    if (stakingInfo.availableBalanceToStake.isZero()) {
      return t('Not enough amount to stake more.');
    }

    if (bondAmount.gt(stakingInfo.availableBalanceToStake ?? BN_ZERO)) {
      return t('It is more than the available balance to stake.');
    }

    if (bondAmount.lt(stakingInfo.poolStakingConsts?.minJoinBond ?? BN_ZERO)) {
      return t('It is less than the minimum amount to join a pool.');
    }

    return undefined;
  }, [bondAmount, stakingInfo.availableBalanceToStake, stakingInfo.poolStakingConsts?.minJoinBond, t]);

  const onSearch = useCallback((query: string) => setSearchedQuery(query), []);
  const onNext = useCallback(() => setStep(step + 1), [step]);
  const onBack = useCallback(() => {
    step > POOL_STEPS.CHOOSE_POOL
      ? setStep(step - 1)
      : navigate('/pool/' + genesisHash + '/stake') as void;
  }, [genesisHash, navigate, step]);

  const transactionFlow = useTransactionFlow({
    backPathTitle: t('Joining Pool'),
    closeReview: onBack,
    formatted,
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
              bondAmount={bondAmount}
              errorMessage={errorMessage}
              estimatedFee2={estimatedFee2}
              formatted={formatted}
              genesisHash={genesisHash}
              onBack={onBack}
              onNext={onNext}
              selectedPool={selectedPool}
              setBondAmount={setBondAmount}
              stakingInfo={stakingInfo}
            />
        }
      </Motion>
    </Grid>
  );
}
