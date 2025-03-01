// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


/* eslint-disable react/jsx-max-props-per-line */

import type { TxInfo } from '@polkadot/extension-polkagate/src/util/types';
import type { StakingInputs } from '../../../type';

import { faHandDots } from '@fortawesome/free-solid-svg-icons';
import { Grid } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { openOrFocusTab } from '@polkadot/extension-polkagate/src/fullscreen/accountDetails/components/CommonTasks';
import FullScreenHeader from '@polkadot/extension-polkagate/src/fullscreen/governance/FullScreenHeader';
import Bread from '@polkadot/extension-polkagate/src/fullscreen/partials/Bread';
import { Title } from '@polkadot/extension-polkagate/src/fullscreen/sendFund/InputPage';
import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';
import { BN } from '@polkadot/util';

import { useTranslation } from '../../../../../components/translate';
import { useFullscreen, usePool, useStakingConsts, useValidators, useValidatorsIdentities } from '../../../../../hooks';
import WaitScreen from '../../../../governance/partials/WaitScreen';
import Confirmation from '../../../easyMode/Confirmation';
import { STEPS } from '../../stake';
import InputPage from './InputPage';
import Review from './Review';

export default function ManageValidators(): React.ReactElement {
  useFullscreen();

  const { t } = useTranslation();
  const { address } = useParams<{ address: string }>();
  const pool = usePool(address);
  const stakingConsts = useStakingConsts(address);

  const allValidatorsInfo = useValidators(address);
  const allValidatorsAccountIds = useMemo(() => allValidatorsInfo && allValidatorsInfo.current.concat(allValidatorsInfo.waiting)?.map((v) => v.accountId), [allValidatorsInfo]);
  const allValidatorsIdentities = useValidatorsIdentities(address, allValidatorsAccountIds);

  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [step, setStep] = useState<number>(STEPS.INDEX);
  const [inputs, setInputs] = useState<StakingInputs>();

  const staked = useMemo(() => pool === undefined ? undefined : new BN(pool?.member?.points ?? 0), [pool]);

  const onClose = useCallback(() => openOrFocusTab(`/poolfs/${address}`, true), [address]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader page='stake' unableToChangeAccount />
      <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', display: 'block', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll', px: '4%' }}>
        <Bread />
        <Title
          height='100px'
          icon={faHandDots}
          text={t('Manage Pool Validators')}
        />
        <Grid alignItems='center' container item justifyContent='flex-start'>
          {step === STEPS.INDEX &&
            <InputPage
              address={address}
              inputs={inputs}
              pool={pool}
              setInputs={setInputs}
              setStep={setStep}
              staked={staked}
              stakingConsts={stakingConsts}
            />
          }
          {[STEPS.REVIEW, STEPS.PROXY, STEPS.SIGN_QR].includes(step) && inputs &&
            <Review
              address={address}
              allValidatorsIdentities={allValidatorsIdentities}
              inputs={inputs}
              setStep={setStep}
              setTxInfo={setTxInfo}
              staked={staked}
              stakingConsts={stakingConsts}
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
