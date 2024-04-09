// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { PoolStakingConsts, StakingConsts } from '../../../util/types';

import { faArrowCircleDown, faCircleDown, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { getValue } from '@polkadot/extension-polkagate/src/popup/account/util';
import ShowPool from '@polkadot/extension-polkagate/src/popup/staking/partial/ShowPool';
import { BN, BN_ZERO } from '@polkadot/util';

import { PoolStakingIcon } from '../../../components';
import { useBalances, useFullscreen, useInfo, usePool, usePoolConsts, useStakingConsts, useTranslation, useUnSupportedNetwork } from '../../../hooks';
import { STAKING_CHAINS } from '../../../util/constants';
import { openOrFocusTab } from '../../accountDetailsFullScreen/components/CommonTasks';
import { FullScreenHeader } from '../../governance/FullScreenHeader';
import { Title } from '../../sendFund/InputPage';
import DisplayBalance from '../partials/DisplayBalance';
import ActiveValidators from '../solo/partials/ActiveValidators';

interface SessionIfo {
  eraLength: number;
  eraProgress: number;
  currentEra: number;
}

interface State {
  api?: ApiPromise;
  stakingConsts?: StakingConsts;
  poolConsts?: PoolStakingConsts;
}

export default function Index (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  useFullscreen();

  const history = useHistory();
  const { pathname, state } = useLocation<State>();
  const { address } = useParams<{ address: string }>();

  const { api, chain } = useInfo(address);

  useUnSupportedNetwork(address, STAKING_CHAINS);

  const [refresh, setRefresh] = useState<boolean>(false);
  const pool = usePool(address, undefined, refresh);
  const stakingConsts = useStakingConsts(address, state?.stakingConsts);
  const consts = usePoolConsts(address, state?.poolConsts);
  const balances = useBalances(address, refresh, setRefresh);

  const staked = useMemo(() => pool === undefined ? undefined : new BN(pool?.member?.points ?? 0), [pool]);
  const claimable = useMemo(() => pool === undefined ? undefined : new BN(pool?.myClaimable ?? 0), [pool]);

  const [redeemable, setRedeemable] = useState<BN | undefined>(state?.redeemable);
  const [unlockingAmount, setUnlockingAmount] = useState<BN | undefined>(state?.unlockingAmount);
  const [sessionInfo, setSessionInfo] = useState<SessionIfo>();
  const [toBeReleased, setToBeReleased] = useState<{ date: number, amount: BN }[]>();
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [showRewardStake, setShowRewardStake] = useState<boolean>(false);
  const [showRewardWithdraw, setShowRewardWithdraw] = useState<boolean>(false);
  const [showRedeemableWithdraw, setShowRedeemableWithdraw] = useState<boolean>(false);
  const [currentEraIndex, setCurrentEraIndex] = useState<number | undefined>(state?.currentEraIndex);

  useEffect(() => {
    api && api.derive.session?.progress().then((info) => {
      setSessionInfo({
        currentEra: Number(info.currentEra),
        eraLength: Number(info.eraLength),
        eraProgress: Number(info.eraProgress)
      });
    });
  }, [api]);

  useEffect((): void => {
    api && api.query.staking && api.query.staking.currentEra().then((ce) => {
      setCurrentEraIndex(Number(ce));
    });
  }, [api]);

  useEffect(() => {
    if (pool === undefined || !api || !currentEraIndex || !sessionInfo) {
      setUnlockingAmount(state?.unlockingAmount || undefined);
      setRedeemable(state?.redeemable || undefined);

      return;
    }

    let unlockingValue = BN_ZERO;
    let redeemValue = BN_ZERO;
    const toBeReleased = [];

    if (pool !== null && pool.member?.unbondingEras) { // if pool is fetched but account belongs to no pool then pool===null
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

    setToBeReleased(toBeReleased);
    setRedeemable(redeemValue);
    setUnlockingAmount(unlockingValue);
  }, [pool, api, currentEraIndex, sessionInfo, state?.unlockingAmount, state?.redeemable]);

  const onUnstake = useCallback(() => {
    staked && !staked?.isZero() && history.push({
      pathname: `/pool/unstake/${address}`,
      state: { api, balances, claimable, consts, pathname, pool, redeemable, stakingConsts, unlockingAmount }
    });
  }, [staked, history, address, api, balances, claimable, consts, pathname, pool, redeemable, stakingConsts, unlockingAmount]);

  const goToRewardWithdraw = useCallback(() => {
    claimable && !claimable?.isZero() && setShowRewardWithdraw(true);
  }, [claimable]);

  const goToRewardStake = useCallback(() => {
    claimable && !claimable?.isZero() && setShowRewardStake(true);
  }, [claimable]);

  const goToRedeemableWithdraw = useCallback(() => {
    redeemable && !redeemable?.isZero() && setShowRedeemableWithdraw(true);
  }, [redeemable]);

  const onBackClick = useCallback(() => {
    openOrFocusTab(`/accountfs/${address}/0`);
  }, [address]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader page='stake' />
      <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', display: 'block', height: 'calc(100vh - 70px)', maxWidth: '1282px', overflow: 'scroll', px: '5%' }}>
        <Title
          logo={
            <PoolStakingIcon color={theme.palette.text.primary} height={60} width={60} />
          }
          onBackClick={onBackClick}
          text={t('Staked in Pool')}
        />
        <Grid container item justifyContent='space-between' mb='15px'>
          <Grid container direction='column' item mb='10px' minWidth='735px' rowGap='10px' width='calc(100% - 320px - 3%)'>
            <Grid container maxHeight={window.innerHeight - 264} sx={{ overflowY: 'scroll' }}>
              <DisplayBalance
                actions={[t('unstake')]}
                address={address}
                amount={staked}
                icons={[faMinus]}
                marginTop='0px'
                onClicks={[onUnstake]}
                title={t('Staked')}
              />
              <DisplayBalance
                actions={[t('stake'), t('withdraw')]}
                address={address}
                amount={claimable}
                icons={[faPlus, faCircleDown]}
                onClicks={[goToRewardStake, goToRewardWithdraw]}
                title={t('Rewards')}
              />
              <DisplayBalance
                actions={[t('withdraw')]}
                address={address}
                amount={redeemable}
                icons={[faArrowCircleDown]}
                onClicks={[goToRedeemableWithdraw]}
                title={t('Redeemable')}
              />
              <DisplayBalance
                address={address}
                amount={unlockingAmount}
                isUnstaking
                title={t('Unstaking')}
                toBeReleased={toBeReleased}
              />
              <DisplayBalance
                actions={[t('stake')]}
                address={address}
                amount={getValue('available', balances)}
                icons={[faPlus]}
                onClicks={[onUnstake]} // TODO
                title={t('Available to stake')}
              />
              {pool &&
              <ShowPool
                api={api}
                chain={chain}
                label={t('Pool')}
                labelPosition='center'
                mode='Default'
                pool={pool}
                showInfo
                style={{
                  m: '40px auto 0',
                  width: '100%'
                }}
              />
              }
            </Grid>
          </Grid>
          <Grid container direction='column' gap='15px' item width='320px'>
            {/* <RewardsChart
              address={address}
              rewardDestinationAddress={rewardDestinationAddress}
            /> */}
          </Grid>

        </Grid>

      </Grid>
      {/* <Info
        address={address}
        info={consts}
        setShowInfo={setShowInfo}
        showInfo={showInfo}
      /> */}
      {/* {showRewardStake && formatted && api && claimable && staked && chain &&
        <RewardsStakeReview
          address={address}
          amount={claimable}
          api={api}
          chain={chain}
          formatted={formatted}
          setRefresh={setRefresh}
          setShow={setShowRewardStake}
          show={showRewardStake}
          staked={staked}
        />} */}
      {/* {showRewardWithdraw && formatted && api && getValue('available', balances) && chain && claimable &&
        <RewardsWithdrawReview
          address={address}
          amount={claimable}
          api={api}
          available={getValue('available', balances)}
          chain={chain}
          formatted={formatted}
          setRefresh={setRefresh}
          setShow={setShowRewardWithdraw}
          show={showRewardWithdraw}
        />} */}
      {/* {showRedeemableWithdraw && formatted && api && getValue('available', balances) && chain && redeemable && !redeemable?.isZero() &&
        <RedeemableWithdrawReview
          address={address}
          amount={redeemable}
          api={api}
          available={getValue('available', balances)}
          chain={chain}
          formatted={formatted}
          setRefresh={setRefresh}
          setShow={setShowRedeemableWithdraw}
          show={showRedeemableWithdraw}
        />} */}
    </Grid>
  );
}
