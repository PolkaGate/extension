// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faHand } from '@fortawesome/free-solid-svg-icons';
import { Grid } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';

import { openOrFocusTab } from '@polkadot/extension-polkagate/src/fullscreen/accountDetailsFullScreen/components/CommonTasks';
import { FullScreenHeader } from '@polkadot/extension-polkagate/src/fullscreen/governance/FullScreenHeader';
import { Title } from '@polkadot/extension-polkagate/src/fullscreen/sendFund/InputPage';
import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';
import { TxInfo } from '@polkadot/extension-polkagate/src/util/types';

import { useTranslation } from '../../../../components/translate';
import { useFullscreen } from '../../../../hooks';
import WaitScreen from '../../../governance/partials/WaitScreen';
import Confirmation from '../../easyMode/Confirmation';
import { Inputs } from '../../Entry';
import InputPage from './InputPage';
import Review from './Review';

export const STEPS = {
  INDEX: 0,
  REVIEW: 1,
  CONFIRM: 2,
  WAIT_SCREEN: 3,
  PROXY: 100
};

export default function ManageValidators (): React.ReactElement {
  const { t } = useTranslation();

  useFullscreen();

  const { address } = useParams<{ address: string }>();

  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [step, setStep] = useState<number>(STEPS.INDEX);
  const [inputs, setInputs] = useState<Inputs>();

  const onClose = useCallback(
    () => openOrFocusTab(`/solofs/${address}`, true)
    , [address]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader page='stake' />
      <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', display: 'block', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll', px: '6%' }}>
        <Title
          icon={faHand}
          text={t('Manage Validators')}
        />
        <Grid alignItems='center' container item justifyContent='flex-start'>
          {step === STEPS.INDEX &&
          <InputPage
            address={address}
            inputs={inputs}
            setInputs={setInputs}
            setStep={setStep}
          />
          }
          {[STEPS.REVIEW, STEPS.PROXY].includes(step) && inputs &&
          <Review
            address={address}
            inputs={inputs}
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
            handleDone={onClose}
            txInfo={txInfo}
          />
          }
        </Grid>
      </Grid>
    </Grid>
  );
}
