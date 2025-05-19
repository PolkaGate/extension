// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { PoolInfo } from '../../../../util/types';

import { Grid } from '@mui/material';
import React, { useCallback, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Motion } from '../../../../components';
import { useBackground } from '../../../../hooks';
import { UserDashboardHeader } from '../../../../partials';
import JoinPoolBackButton from '../../partial/JoinPoolBackButton';
import { INITIAL_POOL_FILTER_STATE, poolFilterReducer } from '../../partial/PoolFilter';
import ChoosePool from './ChoosePool';

export enum POOL_STEPS {
  CHOOSE_POOL = 1,
  CONFIG = 2,
  REVIEW = 3
}

export default function JoinPool () {
  useBackground('staking');

  const { genesisHash } = useParams<{ genesisHash: string }>();
  const navigate = useNavigate();

  const [searchedQuery, setSearchedQuery] = useState<string>('');
  const [filter, dispatchFilter] = useReducer(poolFilterReducer, INITIAL_POOL_FILTER_STATE);
  const [step, setStep] = useState(POOL_STEPS.CHOOSE_POOL);
  const [selectedPool, setSelectedPool] = useState<PoolInfo | undefined>(undefined);

  const onSearch = useCallback((query: string) => setSearchedQuery(query), []);
  const onNext = useCallback(() => setStep(step + 1), [step]);
  const onBack = useCallback(() => {
    step > POOL_STEPS.CHOOSE_POOL
      ? setStep(step - 1)
      : navigate('/pool/' + genesisHash + '/stake') as void;
  }, [genesisHash, navigate, step]);

  return (
    <>
      <Grid alignContent='flex-start' container sx={{ height: '100%', position: 'relative' }}>
        <UserDashboardHeader homeType='default' noSelection />
        <Motion style={{ height: 'calc(100% - 50px)' }} variant='slide'>
          <JoinPoolBackButton
            dispatchFilter={dispatchFilter}
            onBack={onBack}
            onSearch={onSearch}
            stepCounter={{ currentStep: 1, totalSteps: 3 }}
            style={{ mb: '15px' }}
          />
          {step === POOL_STEPS.CHOOSE_POOL
            ? (
              <ChoosePool
                filter={filter}
                onNext={onNext}
                searchedQuery={searchedQuery}
                selectedPool={selectedPool}
                setSelectedPool={setSelectedPool}
              />)
            : <></>
          }
        </Motion>
      </Grid>
    </>
  );
}
