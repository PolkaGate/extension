// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { TxInfo } from '../../../util/types';

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';

import { getValue } from '@polkadot/extension-polkagate/src/popup/account/util';

import { PoolStakingIcon } from '../../../components';
import { useBalances, useFullscreen, usePool, useTranslation, useUnSupportedNetwork } from '../../../hooks';
import { FULLSCREEN_WIDTH, STAKING_CHAINS } from '../../../util/constants';
import { openOrFocusTab } from '../../accountDetailsFullScreen/components/CommonTasks';
import { FullScreenHeader } from '../../governance/FullScreenHeader';
import { Title } from '../../sendFund/InputPage';
import Entry from '../Entry';
import PoolOptionsBig from '../partials/PoolOptionsBig';
import { STEPS } from '..';
import PoolStaked from './PoolStaked';
import Stake from './stake';
import StakeRewards from './stakeRewards';
import Unstake from './unstake';

export const MODAL_IDS = {
  NONE: 0,
  UNSTAKE: 1,
  STAKE_REWARDS: 2,
  WITHDRAW_REWARDS: 3,
  REDEEM: 4,
  STAKE: 5,
  STAKE_EXTRA: 6
};

export default function Index (): React.ReactElement {
  useFullscreen();

  const { t } = useTranslation();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();

  useUnSupportedNetwork(address, STAKING_CHAINS);

  const [refresh, setRefresh] = useState<boolean>(false);
  const pool = usePool(address, undefined, refresh);
  const balances = useBalances(address, refresh, setRefresh);

  const [showId, setShow] = useState<number>(MODAL_IDS.NONE);
  const [step, setStep] = useState<number>(STEPS.INDEX);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();

  const onBack = useCallback(() => {
    openOrFocusTab(`/accountfs/${address}/0`, true);
  }, [address]);

  const getTitle = useCallback((step): string => {
    switch (step) {
      case STEPS.JOIN_POOL:
        return t('Join Pool');
      case STEPS.CREATE_POOL:
        return t('Create Pool');
      case STEPS.CREATE_REVIEW:
      case STEPS.JOIN_REVIEW:
        return t('Review');
      case STEPS.JOIN_CONFIRM:
      case STEPS.CREATE_CONFIRM:
        return t('Confirm');
      default:
        return t('Pool Staking');
    }
  }, [t]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader page='stake' />
      {showId !== MODAL_IDS.STAKE &&
        <PoolStaked
          address={address}
          balances={balances}
          pool={pool}
          setShow={setShow}
        />
      }
      {showId === MODAL_IDS.STAKE &&
        <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', display: 'block', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll', px: '6%' }}>
          <Title
            logo={<PoolStakingIcon color={theme.palette.text.primary} height={60} width={60} />}
            text={getTitle(step)}
          />
          {step === STEPS.INDEX
            ? <PoolOptionsBig
              address={address}
              setStep={setStep}
            />
            : <Entry
              onBack={onBack}
              setStep={setStep}
              setTxInfo={setTxInfo}
              step={step}
              txInfo={txInfo}
            />
          }
        </Grid>
      }
      {showId === MODAL_IDS.STAKE_EXTRA &&
        <Stake
          address={address}
          setRefresh={setRefresh}
          setShow={setShow}
          show={true}
        />
      }
      {showId === MODAL_IDS.UNSTAKE &&
        <Unstake
          address={address}
          setRefresh={setRefresh}
          setShow={setShow}
          show={true}
        />
      }
      {showId === MODAL_IDS.STAKE_REWARDS &&
        <StakeRewards
          address={address}
          pool={pool}
          setRefresh={setRefresh}
          setShow={setShow}
          show={true}
        />
      }
      {/* <Info
        address={address}
        info={consts}
        setShowInfo={setShowInfo}
        showInfo={showInfo}
      /> */}
    </Grid>
  );
}
