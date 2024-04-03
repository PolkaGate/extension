// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AnyTuple } from '@polkadot/types/types';

import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { Boy as BoyIcon } from '@mui/icons-material';
import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';

import { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { Balance } from '@polkadot/types/interfaces';

import { PoolStakingIcon } from '../../components';
import { useBalances, useFullscreen, useTranslation } from '../../hooks';
import { MyPoolInfo, TxInfo, ValidatorInfo } from '../../util/types';
import { openOrFocusTab } from '../accountDetailsFullScreen/components/CommonTasks';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import WaitScreen from '../governance/partials/WaitScreen';
import { Title } from '../sendFund/InputPage';
import Confirmation from './easyMode/Confirmation';
import Review from './easyMode/Review';
import CreatePool from './pool/create';
import JoinPool from './pool/join';
import InputPage from './easyMode';
import SoloStake from './solo';
import StakingOptions from './StakingOptions';

export const STEPS = {
  INDEX: 0,
  EASY_REVIEW: 1,
  WAIT_SCREEN: 2,
  CONFIRM: 3,
  STAKING_OPTIONS: 4,
  STAKE_SOLO: 5,
  JOIN_POOL: 6,
  JOIN_REVIEW: 7,
  CREATE_POOL: 8,
  CREATE_REVIEW: 9,
  EASY_CONFIRM: 10,
  JOIN_CONFIRM: 11,
  CREATE_CONFIRM: 12,
  PROXY: 100
};

export interface Inputs {
  amount: string | undefined;
  call: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined;
  params: unknown[] | (() => unknown[]);
  pool?: MyPoolInfo,
  estimatedFee?: Balance;
  selectedValidators?: ValidatorInfo[],
  extraInfo: Record<string, unknown>
}
type StepsType = typeof STEPS[keyof typeof STEPS];

function Stake (): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();

  const [refresh, setRefresh] = useState<boolean>(false);
  const balances = useBalances(address, refresh, setRefresh);
  const [step, setStep] = useState<StepsType>(STEPS.INDEX);
  const [inputs, setInputs] = useState<Inputs>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();

  const closeConfirmation = useCallback(() => {
    setRefresh(true);
    openOrFocusTab(`/accountfs/${address}/0`, true);
  }, [address, setRefresh]);

  const getHeaderText = (isSuccess?: boolean) => {
    switch (step) {
      case STEPS.WAIT_SCREEN:
        return t('Staking');
      case STEPS.STAKING_OPTIONS:
        return t('Staking Options');
      case STEPS.STAKE_SOLO:
        return t('Solo Staking');
      case STEPS.JOIN_POOL:
        return t('Join Pool');
      case STEPS.CREATE_POOL:
        return t('Create Pool');
      case STEPS.EASY_REVIEW:
        return t('Review');
      case STEPS.JOIN_REVIEW:
        return t('Review, Join Pool');
      case STEPS.CREATE_REVIEW:
        return t('Review, Create Pool');
      case STEPS.CONFIRM:
        return isSuccess ? t('Staked') : t('Staking Failed');
      default:
        return t('Staking');
    }
  };

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader page='stake' />
      <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', display: 'block', height: 'calc(100vh - 70px)', maxWidth: '900px', overflow: 'scroll', px: '6%' }}>
        <Title
          icon={[STEPS.INDEX, STEPS.EASY_REVIEW, STEPS.STAKING_OPTIONS].includes(step) && faCoins}
          logo={ [STEPS.JOIN_POOL, STEPS.JOIN_REVIEW, STEPS.CREATE_POOL, STEPS.CREATE_REVIEW].includes(step)
            ? <PoolStakingIcon color={theme.palette.text.primary} height={60} width={60} />
            : [STEPS.STAKE_SOLO].includes(step) &&
             <BoyIcon sx={{ color: 'text.primary', fontSize: '62px' }} />}
          text={getHeaderText(txInfo?.success)}
        />
        {step === STEPS.INDEX &&
         <InputPage
           address={address}
           balances={balances}
           inputs={inputs}
           setInputs={setInputs}
           setStep={setStep}
         />
        }
        {step === STEPS.STAKING_OPTIONS &&
         <StakingOptions
           address={address}
           balances={balances}
           inputs={inputs}
           setInputs={setInputs}
           setStep={setStep}
         />
        }
        {STEPS.JOIN_POOL === step &&
         <JoinPool
           setInputs={setInputs}
           setStep={setStep}
         />
        }
        {STEPS.CREATE_POOL === step &&
         <CreatePool
           setInputs={setInputs}
           setStep={setStep}
         />
        }
        {step === STEPS.STAKE_SOLO &&
         <SoloStake
           inputs={inputs}
           setInputs={setInputs}
           setStep={setStep}
         />
        }
        {(inputs && [STEPS.EASY_REVIEW, STEPS.JOIN_REVIEW, STEPS.CREATE_REVIEW, STEPS.PROXY].includes(step)) &&
        <Review
          address={address}
          balances={balances}
          inputs={inputs}
          setRefresh={setRefresh}
          setStep={setStep}
          setTxInfo={setTxInfo}
          step={step}
        />
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {txInfo && step === STEPS.CONFIRM &&
          <Confirmation
            handleDone={closeConfirmation}
            txInfo={txInfo}
          />
        }
      </Grid>
    </Grid>
  );
}

export default React.memo(Stake);
