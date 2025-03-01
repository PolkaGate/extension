// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TxInfo } from '../../util/types';
import type { StakingInputs } from './type';

import { Grid } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';

import { useBalances } from '../../hooks';
import { openOrFocusTab } from '../accountDetails/components/CommonTasks';
import WaitScreen from '../governance/partials/WaitScreen';
import Confirmation from './easyMode/Confirmation';
import Review from './easyMode/Review';
import CreatePool from './pool/create';
import JoinPool from './pool/join';
import SoloStake from './solo/stake';
import EasyMode from './easyMode';
import { STEPS } from '.';

interface Props {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  onBack?: () => void;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  txInfo: TxInfo | undefined
}

function Entry({ onBack, setStep, setTxInfo, step, txInfo }: Props): React.ReactElement {
  const { address } = useParams<{ address: string }>();

  const [refresh, setRefresh] = useState<boolean>(false);
  const balances = useBalances(address, refresh, setRefresh);
  const [inputs, setInputs] = useState<StakingInputs>();

  const closeConfirmation = useCallback(() => {
    setRefresh(true);
    inputs?.pool
      ? openOrFocusTab(`/poolfs/${address}/`, true)
      : openOrFocusTab(`/solofs/${address}/`, true);
  }, [address, inputs?.pool]);

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
      {STEPS.JOIN_POOL === step &&
        <JoinPool
          inputs={inputs}
          setInputs={setInputs}
          setStep={setStep}
        />
      }
      {STEPS.CREATE_POOL === step &&
        <CreatePool
          inputs={inputs}
          setInputs={setInputs}
          setStep={setStep}
        />
      }
      {step === STEPS.STAKE_SOLO &&
        <SoloStake
          inputs={inputs}
          onBack={onBack}
          setInputs={setInputs}
          setStep={setStep}
        />
      }
      {(inputs && [STEPS.EASY_REVIEW, STEPS.SOLO_REVIEW, STEPS.JOIN_REVIEW, STEPS.CREATE_REVIEW, STEPS.PROXY, STEPS.SIGN_QR].includes(step)) &&
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
