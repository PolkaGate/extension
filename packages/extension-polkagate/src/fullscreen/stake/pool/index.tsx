// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TxInfo } from '../../../util/types';

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { BN, BN_ZERO } from '@polkadot/util';

import { PoolStakingIcon } from '../../../components';
import { useBalances, useFullscreen, useInfo, usePool, useTranslation, useUnSupportedNetwork } from '../../../hooks';
import { getValue } from '../../../popup/account/util';
import { FULLSCREEN_WIDTH, STAKING_CHAINS } from '../../../util/constants';
import { openOrFocusTab } from '../../accountDetails/components/CommonTasks';
import FullScreenHeader from '../../governance/FullScreenHeader';
import Bread from '../../partials/Bread';
import { Title } from '../../sendFund/InputPage';
import Entry from '../Entry';
import PoolOptionsBig from '../partials/PoolOptionsBig';
import { STEPS } from '..';
import StakeRewards from './rewards/stake';
import WithdrawRewards from './rewards/withdraw';
import PoolStaked from './PoolStaked';
import WithdrawRedeem from './redeem';
import Stake from './stake';
import Unstake from './unstake';

interface SessionIfo {
  eraLength: number;
  eraProgress: number;
  currentEra: number;
}

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

  const { api } = useInfo(address);

  useUnSupportedNetwork(address, STAKING_CHAINS);

  const [refresh, setRefresh] = useState<boolean>(false);
  const pool = usePool(address, undefined, refresh);
  const balances = useBalances(address, refresh, setRefresh);

  const [showId, setShow] = useState<number>(MODAL_IDS.NONE);
  const [step, setStep] = useState<number>(STEPS.INDEX);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [sessionInfo, setSessionInfo] = useState<SessionIfo>();
  const [currentEraIndex, setCurrentEraIndex] = useState<number | undefined>();

  useEffect(() => {
    api?.derive.session?.progress().then((info) => {
      setSessionInfo({
        currentEra: Number(info.currentEra),
        eraLength: Number(info.eraLength),
        eraProgress: Number(info.eraProgress)
      });
    }).catch(console.error);
  }, [api]);

  useEffect((): void => {
    api?.query['staking']?.['currentEra']().then((ce) => {
      setCurrentEraIndex(Number(ce));
    }).catch(console.error);
  }, [api]);

  const { redeemable, toBeReleased, unlockingAmount } = useMemo(() => {
    if (pool === undefined || !api || !currentEraIndex || !sessionInfo) {
      return { redeemable: undefined, toBeReleased: undefined, unlockingAmount: undefined };
    }

    let unlockingValue = BN_ZERO;
    let redeemValue = BN_ZERO;
    const toBeReleased = [];

    if (pool?.member?.unbondingEras) { // if pool is fetched but account belongs to no pool then pool===null
      for (const [era, unbondingPoint] of Object.entries(pool.member?.unbondingEras)) {
        const remainingEras = Number(era) - currentEraIndex;

        if (remainingEras < 0) {
          redeemValue = redeemValue.add(new BN(unbondingPoint as string));
        } else {
          const amount = new BN(unbondingPoint as string);

          unlockingValue = unlockingValue.add(amount);

          const secToBeReleased = (remainingEras * sessionInfo.eraLength + (sessionInfo.eraLength - sessionInfo.eraProgress)) * 6;

          toBeReleased.push({ amount, date: Date.now() + (secToBeReleased * 1000) });
        }
      }
    }

    return { redeemable: redeemValue, toBeReleased, unlockingAmount: unlockingValue };
  }, [api, currentEraIndex, pool, sessionInfo]);

  const onBack = useCallback(() => {
    openOrFocusTab(`/accountfs/${address}/0`, true);
  }, [address]);

  const getTitle = useCallback((step: number): string => {
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
      case STEPS.CONFIRM:
        return t('Confirmation');
      default:
        return t('Pool Staking');
    }
  }, [t]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader page='stake' unableToChangeAccount />
      {showId !== MODAL_IDS.STAKE &&
        <PoolStaked
          address={address}
          balances={balances}
          pool={pool}
          redeemable={redeemable}
          setShow={setShow}
          toBeReleased={toBeReleased}
          unlockingAmount={unlockingAmount}
        />
      }
      {showId === MODAL_IDS.STAKE && // this is not a modal
        <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', display: 'block', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll', px: '4%' }}>
          <Bread />
          <Title
            height='85px'
            logo={<PoolStakingIcon color={theme.palette.text.primary} height={50} width={50} />}
            ml='-9px'
            padding='0px'
            spacing={0}
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
      {showId === MODAL_IDS.REDEEM &&
        <WithdrawRedeem
          address={address}
          availableBalance={getValue('transferable', balances)}
          redeemable={redeemable}
          setRefresh={setRefresh}
          setShow={setShow}
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
      {showId === MODAL_IDS.WITHDRAW_REWARDS &&
        <WithdrawRewards
          address={address}
          balances={balances}
          pool={pool}
          setRefresh={setRefresh}
          setShow={setShow}
          show={true}
        />
      }
    </Grid>
  );
}
