// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TxInfo } from '../../util/types';

import { faChessQueen, faCoins, faRocket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Boy as BoyIcon } from '@mui/icons-material';
import { Collapse, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';

import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';

import { PButton, PoolStakingIcon } from '../../components';
import { useTranslation } from '../../components/translate';
import { useFullscreen, useInfo, usePoolConsts } from '../../hooks';
import { openOrFocusTab } from '../accountDetails/components/CommonTasks';
import FullScreenHeader from '../governance/FullScreenHeader';
import Bread from '../partials/Bread';
import { Title } from '../sendFund/InputPage';
import AdvancedOptions from './partials/AdvancedOptions';
import StakingMode from './partials/StakingMode';
import Entry from './Entry';

export const STEPS = {
  INDEX: 0,
  EASY_STAKING: 1,
  EASY_REVIEW: 2,
  WAIT_SCREEN: 3,
  CONFIRM: 4,
  STAKE_SOLO: 5,
  SOLO_REVIEW: 6,
  JOIN_POOL: 7,
  JOIN_REVIEW: 8,
  CREATE_POOL: 9,
  CREATE_REVIEW: 10,
  EASY_CONFIRM: 11,
  JOIN_CONFIRM: 12,
  CREATE_CONFIRM: 13,
  PROXY: 100,
  SIGN_QR: 200
};

export type StepsType = typeof STEPS[keyof typeof STEPS];

export default function StakingOptions(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  useFullscreen();

  const { address } = useParams<{ address: string }>();
  const { api, chainName } = useInfo(address);

  const poolConsts = usePoolConsts(address);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [step, setStep] = useState<StepsType>(STEPS.INDEX);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();

  const poolSteps = [STEPS.JOIN_POOL, STEPS.JOIN_REVIEW, STEPS.CREATE_POOL, STEPS.CREATE_REVIEW];
  const generalSteps = [STEPS.EASY_STAKING, STEPS.EASY_REVIEW, STEPS.INDEX, STEPS.CONFIRM, STEPS.WAIT_SCREEN];

  const OnEasyStaking = useCallback(
    () => setStep(STEPS.EASY_STAKING)
    , []);

  const onAdvancedStaking = useCallback(() => {
    setShowAdvancedOptions(!showAdvancedOptions);
  }, [showAdvancedOptions]);

  const onBack = useCallback(
    () => openOrFocusTab(`/accountfs/${address}/0`, true)
    , [address]);

  const getHeaderText = (isSuccess?: boolean) => {
    switch (step) {
      case STEPS.INDEX:
      case STEPS.WAIT_SCREEN:
        return t('Staking');
      case STEPS.STAKE_SOLO:
        return t('Solo Staking');
      case STEPS.JOIN_POOL:
        return t('Join Staking Pool');
      case STEPS.CREATE_POOL:
        return t('Create Staking Pool');
      case STEPS.EASY_REVIEW:
      case STEPS.SOLO_REVIEW:
        return t('Review');
      case STEPS.JOIN_REVIEW:
      case STEPS.CREATE_REVIEW:
        return t('Review');
      case STEPS.CONFIRM:
        return isSuccess ? t('Staked') : t('Staking Failed');
      default:
        return t('Staking');
    }
  };

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader page='stake' unableToChangeAccount />
      <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', display: 'block', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll', px: '4%' }}>
        <Bread />
        <Title
          height='85px'
          icon={
            generalSteps.includes(step)
              ? faCoins
              : undefined
          }
          logo={
            poolSteps.includes(step)
              ? <PoolStakingIcon color={theme.palette.text.primary} height={50} width={50} />
              : [STEPS.STAKE_SOLO, STEPS.SOLO_REVIEW].includes(step) &&
              <BoyIcon sx={{ color: 'text.primary', fontSize: '50px' }} />}
          ml={generalSteps.includes(step) ? undefined : '-25px'}
          padding='0px'
          text={getHeaderText(txInfo?.success)}
        />
        {step === STEPS.INDEX
          ? <Grid container item>
            <Typography fontSize='16px' fontWeight={500} pb='15px' width='100%'>
              {t('Options are available to commence staking in {{chainName}}. Please select your preference, taking into consideration the minimum requirements for receiving rewards per era.', { replace: { chainName } })}
            </Typography>
            <Grid alignItems='center' container item justifyContent='flex-start' pt='40px'>
              <StakingMode
                api={api}
                balance={poolConsts?.minJoinBond}
                balanceText={t('Minimum to receive rewards')}
                helperText={t('We handle all the intricate minimum checks and pool or validator selections on your behalf.')}
                logo={
                  <FontAwesomeIcon
                    color={`${theme.palette.secondary.light}`}
                    fontSize='38px'
                    icon={faRocket}
                  />
                }
                onClick={OnEasyStaking}
                showQuestionMark
                style={{
                  m: '5px auto',
                  width: '100%'
                }}
                text={t('Automated processes for simplicity.')}
                title={t('Easy Staking')}
              />
              <StakingMode
                api={api}
                helperText={t('You are responsible for checking boundary values and selecting suitable validators or pools, but don\'t worry, we\'ve still got your back.')}
                logo={
                  <FontAwesomeIcon
                    color={`${theme.palette.secondary.light}`}
                    fontSize='38px'
                    icon={faChessQueen}
                  />
                }
                onClick={onAdvancedStaking}
                rotations={{ transform: showAdvancedOptions ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }}
                showQuestionMark
                style={{
                  mt: '15px',
                  width: '100%'
                }}
                text={t('Manual control for experienced users.')}
                tipPlace='bottom'
                title={t('Advanced Staking')}
              />
              <Collapse in={showAdvancedOptions} sx={{ width: '100%' }}>
                <AdvancedOptions address={address} setStep={setStep} />
              </Collapse>
              <Grid container item sx={{ '> div': { m: 0, width: '64%' }, justifyContent: 'flex-end', mt: '5px' }}>
                <PButton
                  _mt='20px'
                  _onClick={onBack}
                  _variant='outlined'
                  _width={40}
                  text={t('Back')}
                />
              </Grid>
            </Grid>
          </Grid>
          : <Entry
            setStep={setStep}
            setTxInfo={setTxInfo}
            step={step}
            txInfo={txInfo}
          />
        }
      </Grid>
    </Grid>
  );
}
