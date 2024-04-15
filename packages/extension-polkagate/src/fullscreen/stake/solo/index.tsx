// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faArrowRotateLeft, faBolt, faCircleDown, faClockFour, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Boy as BoyIcon } from '@mui/icons-material';
import { Grid } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { BN, BN_ZERO } from '@polkadot/util';

import { useBalances, useFullscreen, useInfo, useStakingAccount, useStakingRewardDestinationAddress, useStakingRewards, useTranslation, useUnSupportedNetwork } from '../../../hooks';
import { STAKING_CHAINS } from '../../../util/constants';
import { openOrFocusTab } from '../../accountDetailsFullScreen/components/CommonTasks';
import { FullScreenHeader } from '../../governance/FullScreenHeader';
import { Title } from '../../sendFund/InputPage';
import DisplayBalance from '../partials/DisplayBalance';
import ActiveValidators from './partials/ActiveValidators';
import CommonTasks from './partials/CommonTasks';
import Info from './partials/Info';
import RewardsChart from './partials/RewardsChart';
import FastUnstake from './fastUnstake';
import Pending from './pending';
import Redeem from './redeem';
import Restake from './restake';
import StakeMore from './stakeExtra';
import Unstake from './unstake';

interface SessionIfo {
  eraLength: number;
  eraProgress: number;
  currentEra: number;
}

export default function Index(): React.ReactElement {
  const { t } = useTranslation();

  useFullscreen();

  const { address } = useParams<{ address: string }>();

  useUnSupportedNetwork(address, STAKING_CHAINS);

  const [refresh, setRefresh] = useState<boolean>(false);
  const stakingAccount = useStakingAccount(address, undefined, refresh, setRefresh);
  const rewardDestinationAddress = useStakingRewardDestinationAddress(stakingAccount);

  const rewards = useStakingRewards(address, stakingAccount);
  const { api } = useInfo(address);
  const balances = useBalances(address, refresh, setRefresh);

  const redeemable = useMemo(() => stakingAccount?.redeemable, [stakingAccount?.redeemable]);
  const staked = useMemo(() => stakingAccount?.stakingLedger?.active, [stakingAccount?.stakingLedger?.active]);
  const availableToSoloStake = balances?.freeBalance && staked && balances.freeBalance.sub(staked);

  const [unlockingAmount, setUnlockingAmount] = useState<BN | undefined>();
  const [sessionInfo, setSessionInfo] = useState<SessionIfo>();
  const [toBeReleased, setToBeReleased] = useState<{ date: number, amount: BN }[]>();
  const [showUnstake, setShowUnstake] = useState<boolean>(false);
  const [showFastUnstake, setShowFastUnstake] = useState<boolean>(false);
  const [showPending, setShowPending] = useState<boolean>(false);
  const [showRedeem, setShowRedeem] = useState<boolean>(false);
  const [showRestake, setShowRestake] = useState<boolean>(false);
  const [showStakeMore, setShowStakeMore] = useState<boolean>(false);

  useEffect(() => {
    api && api.derive.session?.progress().then((sessionInfo) => {
      setSessionInfo({
        currentEra: Number(sessionInfo.currentEra),
        eraLength: Number(sessionInfo.eraLength),
        eraProgress: Number(sessionInfo.eraProgress)
      });
    });
  }, [api]);

  useEffect(() => {
    if (!stakingAccount || !sessionInfo) {
      setUnlockingAmount(undefined);

      return;
    }

    let unlockingValue = BN_ZERO;
    const toBeReleased = [];

    if (stakingAccount?.unlocking) {
      for (const [_, { remainingEras, value }] of Object.entries(stakingAccount.unlocking)) {
        if (remainingEras.gtn(0)) {
          const amount = new BN(value as unknown as string);

          unlockingValue = unlockingValue.add(amount);
          const secToBeReleased = (Number(remainingEras.subn(1)) * sessionInfo.eraLength + (sessionInfo.eraLength - sessionInfo.eraProgress)) * 6;

          toBeReleased.push({ amount, date: Date.now() + (secToBeReleased * 1000) });
        }
      }
    }

    setToBeReleased(toBeReleased);
    setUnlockingAmount(unlockingValue);
  }, [sessionInfo, stakingAccount]);

  const onUnstake = useCallback(() => {
    setShowUnstake(true);
  }, []);

  const onStakeExtra = useCallback(() => {
    setShowStakeMore(true);
  }, []);

  const onFastUnstake = useCallback(() => {
    setShowFastUnstake(true);
  }, []);

  const onPendingRewards = useCallback(() => {
    setShowPending(true);
  }, []);

  const onRedeemableWithdraw = useCallback(() => {
    redeemable && !redeemable?.isZero() && setShowRedeem(true);
  }, [redeemable]);

  const onReStake = useCallback(() => {
    unlockingAmount && !unlockingAmount?.isZero() && setShowRestake(true);
  }, [unlockingAmount]);

  const onBackClick = useCallback(() => {
    openOrFocusTab(`/accountfs/${address}/0`, true);
  }, [address]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader page='stake' />
      <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', display: 'block', height: 'calc(100vh - 70px)', maxWidth: '1282px', overflow: 'scroll', px: '5%' }}>
        <Title
          logo={<BoyIcon sx={{ color: 'text.primary', fontSize: '60px' }} />}
          onBackClick={onBackClick}
          text={t('Staked Solo')}
        />
        <Grid container item justifyContent='space-between' mb='15px'>
          <Grid container direction='column' item mb='10px' minWidth='715px' rowGap='10px' width='calc(100% - 320px - 3%)'>
            <Grid container item>
              <DisplayBalance
                actions={[t('unstake'), t('fast unstake')]}
                address={address}
                amount={staked as unknown as BN}
                icons={[faMinus, faBolt]}
                marginTop='0px'
                onClicks={[onUnstake, onFastUnstake]}
                title={t('Staked')}
              />
              <DisplayBalance
                actions={[t('pending')]}
                address={address}
                amount={rewards}
                icons={[faClockFour]}
                onClicks={[onPendingRewards]}
                title={t('Rewards Paid')}
              />
              <DisplayBalance
                actions={[t('withdraw')]}
                address={address}
                amount={redeemable}
                icons={[faCircleDown]}
                onClicks={[onRedeemableWithdraw]}
                title={t('Redeemable')}
              />
              <DisplayBalance
                actions={[t('restake')]}
                address={address}
                amount={unlockingAmount}
                icons={[faArrowRotateLeft]}
                isUnstaking
                onClicks={[onReStake]}
                title={t('Unstaking')}
                toBeReleased={toBeReleased}
              />
              <DisplayBalance
                actions={[t('stake extra')]}
                address={address}
                amount={availableToSoloStake}
                icons={[faPlus]}
                onClicks={[onStakeExtra]}
                title={t('Available to stake')}
              />
              <Info
                address={address}
              />
            </Grid>
          </Grid>
          <Grid container direction='column' gap='15px' item width='320px'>
            <RewardsChart
              address={address}
              rewardDestinationAddress={rewardDestinationAddress}
            />
            <ActiveValidators
              address={address}
            />
            <CommonTasks
              address={address}
              setRefresh={setRefresh}
            />
          </Grid>
        </Grid>
      </Grid>
      {showUnstake &&
        <Unstake
          address={address}
          setRefresh={setRefresh}
          setShow={setShowUnstake}
          show={showUnstake}
        />}
      {showFastUnstake &&
        <FastUnstake
          address={address}
          setRefresh={setRefresh}
          setShow={setShowFastUnstake}
          show={showFastUnstake}
        />}
      {showPending &&
        <Pending
          address={address}
          setRefresh={setRefresh}
          setShow={setShowPending}
          show={showPending}
        />}
      {showRedeem &&
        <Redeem
          address={address}
          redeemable={redeemable}
          setRefresh={setRefresh}
          setShow={setShowRedeem}
          show={showRedeem}
        />}
      {showRestake &&
        <Restake
          address={address}
          setRefresh={setRefresh}
          setShow={setShowRestake}
          show={showRestake}
        />}
      {showStakeMore &&
        <StakeMore
          address={address}
          setRefresh={setRefresh}
          setShow={setShowStakeMore}
          show={showStakeMore}
        />}
    </Grid>
  );
}
