// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { noop } from '@polkadot/util';

import { Motion } from '../../../../components';
import { useBackground } from '../../../../hooks';
import { UserDashboardHeader } from '../../../../partials';
import JoinPoolBackButton from '../../partial/JoinPoolBackButton';
import ChoosePool from './ChoosePool';

export enum POOL_STEPS {
  CHOOSE_POOL,
  CONFIG,
  REVIEW
}

export default function JoinPool () {
  useBackground('staking');

  const { genesisHash } = useParams<{ genesisHash: string }>();
  const navigate = useNavigate();

  const [searchedQuery, setSearchedQuery] = useState<string>('');
  const [step, setStep] = useState(POOL_STEPS.CHOOSE_POOL);

  const onSearch = useCallback((query: string) => setSearchedQuery(query), []);
  const onBack = useCallback(() => navigate('/pool/' + genesisHash + '/stake') as void, [genesisHash, navigate]);

  return (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader homeType='default' noSelection />
        <Motion variant='slide'>
          <JoinPoolBackButton
            onBack={onBack}
            onFilter={noop}
            onSearch={onSearch}
            stepCounter={{ currentStep: 1, totalSteps: 3 }}
          />
          {step === POOL_STEPS.CHOOSE_POOL
            ? <ChoosePool />
            : <></>
          }
        </Motion>
      </Grid>
    </>
  );
}
