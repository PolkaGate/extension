// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AnyTuple } from '@polkadot/types/types';

import { Grid } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';

import { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { Balance } from '@polkadot/types/interfaces';

import { useBalances } from '../../hooks';
import { MyPoolInfo, TxInfo, ValidatorInfo } from '../../util/types';
import { openOrFocusTab } from '../accountDetailsFullScreen/components/CommonTasks';
import WaitScreen from '../governance/partials/WaitScreen';
import Confirmation from './easyMode/Confirmation';
import Review from './easyMode/Review';
import CreatePool from './pool/create';
import JoinPool from './pool/join';
import EasyMode from './easyMode';
import SoloStake from './solo/stake';
import StakingOptions from './StakingOptions';
import { STEPS } from '.';

export interface Inputs {
  amount: string | undefined;
  call: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined;
  mode?: number;
  params: unknown[] | (() => unknown[]);
  pool?: MyPoolInfo,
  estimatedFee?: Balance;
  selectedValidators?: ValidatorInfo[],
  extraInfo: Record<string, unknown>
}

interface Props {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>
}

function Entry ({ setStep, step }: Props): React.ReactElement {
  const { address } = useParams<{ address: string }>();

  const [refresh, setRefresh] = useState<boolean>(false);
  const balances = useBalances(address, refresh, setRefresh);
  const [inputs, setInputs] = useState<Inputs>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();

  const closeConfirmation = useCallback(() => {
    setRefresh(true);
    openOrFocusTab(`/accountfs/${address}/0`, true);
  }, [address, setRefresh]);

  return (
    <Grid container item>
      {step === STEPS.EASY_STAKING &&
         <EasyMode
           address={address}
           balances={balances}
           inputs={inputs}
           setInputs={setInputs}
           setStep={setStep}
         />
      }
      {step === STEPS.INDEX &&
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
      {(inputs && [STEPS.EASY_REVIEW, STEPS.SOLO_REVIEW, STEPS.JOIN_REVIEW, STEPS.CREATE_REVIEW, STEPS.PROXY].includes(step)) &&
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
  );
}

export default React.memo(Entry);