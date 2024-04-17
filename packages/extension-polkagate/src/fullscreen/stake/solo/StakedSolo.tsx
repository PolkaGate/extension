// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faArrowRotateLeft, faBolt, faCircleDown, faClockFour, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Boy as BoyIcon } from '@mui/icons-material';
import { Grid } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { BN, BN_ZERO } from '@polkadot/util';

import { useBalances, useInfo, useStakingAccount, useStakingRewardDestinationAddress, useStakingRewards, useTranslation, useUnSupportedNetwork } from '../../../hooks';
import { STAKING_CHAINS } from '../../../util/constants';
import { openOrFocusTab } from '../../accountDetailsFullScreen/components/CommonTasks';
import { Title } from '../../sendFund/InputPage';
import DisplayBalance from '../partials/DisplayBalance';
import ActiveValidators from './partials/ActiveValidators';
import CommonTasks from './partials/CommonTasks';
import Info from './partials/Info';
import RewardsChart from './partials/RewardsChart';
import { MODAL_IDS } from '.';

interface SessionIfo {
  eraLength: number;
  eraProgress: number;
  currentEra: number;
}

interface Props{
  setShow: React.Dispatch<React.SetStateAction<number>>
}

export default function StakedSolo ({ setShow }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { address } = useParams<{ address: string }>();

  useUnSupportedNetwork(address, STAKING_CHAINS);

  const [refresh, setRefresh] = useState<boolean>(false);
  const stakingAccount = useStakingAccount(address, undefined, refresh, setRefresh);
  const rewardDestinationAddress = useStakingRewardDestinationAddress(stakingAccount);

  const rewards = useStakingRewards(address, stakingAccount);
  const { api } = useInfo(address);
  const balances = useBalances(address, refresh, setRefresh);

  const redeemable = useMemo(() => stakingAccount?.redeemable, [stakingAccount?.redeemable]);
  const staked = useMemo(() => stakingAccount?.stakingLedger?.active as unknown as BN, [stakingAccount?.stakingLedger?.active]);
  const availableToSoloStake = balances?.freeBalance && staked && balances.freeBalance.sub(staked);

  const [unlockingAmount, setUnlockingAmount] = useState<BN | undefined>();
  const [sessionInfo, setSessionInfo] = useState<SessionIfo>();
  const [toBeReleased, setToBeReleased] = useState<{ date: number, amount: BN }[]>();

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
    setShow(MODAL_IDS.UNSTAKE);
  }, [setShow]);

  const onStakeOrExtra = useCallback(() => {
    staked && !staked.isZero()
      ? setShow(MODAL_IDS.STAKE_EXTRA)
      : setShow(MODAL_IDS.STAKE);
  }, [setShow, staked]);

  const onFastUnstake = useCallback(() => {
    setShow(MODAL_IDS.FAST_UNSTAKE);
  }, [setShow]);

  const onPendingRewards = useCallback(() => {
    setShow(MODAL_IDS.PENDING);
  }, [setShow]);

  const onRedeemableWithdraw = useCallback(() => {
    redeemable && !redeemable?.isZero() && setShow(MODAL_IDS.REDEEM);
  }, [redeemable, setShow]);

  const onReStake = useCallback(() => {
    unlockingAmount && !unlockingAmount?.isZero() && setShow(MODAL_IDS.RE_STAKE);
  }, [setShow, unlockingAmount]);

  const onBack = useCallback(() => {
    openOrFocusTab(`/accountfs/${address}/0`, true);
  }, [address]);

  return (
    <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', display: 'block', height: 'calc(100vh - 70px)', maxWidth: '1282px', overflow: 'scroll', px: '5%' }}>
      <Title
        logo={<BoyIcon sx={{ color: 'text.primary', fontSize: '60px' }} />}
        onBackClick={onBack}
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
              actions={[staked && !staked.isZero() ? t('stake extra') : t('stake')]}
              address={address}
              amount={availableToSoloStake}
              icons={[faPlus]}
              onClicks={[onStakeOrExtra]}
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
  );
}
