// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { PoolStakingConsts, StakingConsts } from '../../../util/types';

import { faArrowCircleDown, faCircleDown, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { getValue } from '@polkadot/extension-polkagate/src/popup/account/util';
import ShowPool from '@polkadot/extension-polkagate/src/popup/staking/partial/ShowPool';
import { BN, BN_ZERO } from '@polkadot/util';

import { ActionContext, FormatBalance, PoolStakingIcon } from '../../../components';
import { useBalances, useFullscreen, useInfo, useMyAccountIdentity, usePool, usePoolConsts, useStakingConsts, useTranslation, useUnSupportedNetwork } from '../../../hooks';
import useIsExtensionPopup from '../../../hooks/useIsExtensionPopup';
import { BALANCES_VALIDITY_PERIOD, DATE_OPTIONS, STAKING_CHAINS, TIME_TO_SHAKE_ICON } from '../../../util/constants';
import { FullScreenHeader } from '../../governance/FullScreenHeader';
import { Title } from '../../sendFund/InputPage';
import DisplayBalance from '../partials/DisplayBalance';

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


  const onAction = useContext(ActionContext);
  const history = useHistory();
  const { pathname, state } = useLocation<State>();
  const { address } = useParams<{ address: string }>();

  const { api, chain, chainName, decimal, formatted, token } = useInfo(address);
  const onExtension = useIsExtensionPopup();

  useUnSupportedNetwork(address, STAKING_CHAINS);

  const [refresh, setRefresh] = useState<boolean>(false);
  const pool = usePool(address, undefined, refresh);
  const stakingConsts = useStakingConsts(address, state?.stakingConsts);
  const consts = usePoolConsts(address, state?.poolConsts);
  const balances = useBalances(address, refresh, setRefresh);
  const identity = useMyAccountIdentity(address);

  const _judgement = identity && JSON.stringify(identity.judgements).match(/reasonable|knownGood/gi);

  const staked = useMemo(() => pool === undefined ? undefined : new BN(pool?.member?.points ?? 0), [pool]);
  const claimable = useMemo(() => pool === undefined ? undefined : new BN(pool?.myClaimable ?? 0), [pool]);
  const isPoolInfoOutdated = useMemo(() => pool && (Date.now() - pool.date) > BALANCES_VALIDITY_PERIOD, [pool]);

  const [redeemable, setRedeemable] = useState<BN | undefined>(state?.redeemable);
  const [unlockingAmount, setUnlockingAmount] = useState<BN | undefined>(state?.unlockingAmount);
  const [sessionInfo, setSessionInfo] = useState<SessionIfo>();
  const [toBeReleased, setToBeReleased] = useState<{ date: number, amount: BN }[]>();
  const [showUnlockings, setShowUnlockings] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [showRewardStake, setShowRewardStake] = useState<boolean>(false);
  const [showRewardWithdraw, setShowRewardWithdraw] = useState<boolean>(false);
  const [showRedeemableWithdraw, setShowRedeemableWithdraw] = useState<boolean>(false);
  const [currentEraIndex, setCurrentEraIndex] = useState<number | undefined>(state?.currentEraIndex);
  const [shake, setShake] = useState<boolean>(false); // to shake to persuade to stake ;)

  useEffect(() => {
    if (staked?.isZero() && pool === null) {
      setShake(true);
      setTimeout(() => setShake(false), TIME_TO_SHAKE_ICON);
    }
  }, [pool, pool?.bondedPool?.state, shake, staked]);

  const _toggleShowUnlockings = useCallback(() => setShowUnlockings(!showUnlockings), [showUnlockings]);

  useEffect(() => {
    api && api.derive.session?.progress().then((sessionInfo) => {
      setSessionInfo({
        currentEra: Number(sessionInfo.currentEra),
        eraLength: Number(sessionInfo.eraLength),
        eraProgress: Number(sessionInfo.eraProgress)
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

  const onBackClick = useCallback(() => {
    if (chain?.genesisHash && onExtension) {
      onAction(`/account/${chain.genesisHash}/${address}/`);
    } else if (!onExtension) {
      onAction(`/accountfs/${address}/0`);
    } else {
      onAction('/');
    }
  }, [address, chain?.genesisHash, onAction, onExtension]);

  const goToStake = useCallback(() => {
    history.push({
      pathname: `/pool/stake/${address}`,
      state: { api, consts, pathname, pool, stakingConsts }
    });
  }, [address, api, consts, history, pool, pathname, stakingConsts]);

  const onUnstake = useCallback(() => {
    staked && !staked?.isZero() && history.push({
      pathname: `/pool/unstake/${address}`,
      state: { api, balances, claimable, consts, pathname, pool, redeemable, stakingConsts, unlockingAmount }
    });
  }, [staked, history, address, api, balances, claimable, consts, pathname, pool, redeemable, stakingConsts, unlockingAmount]);

  const goToNominations = useCallback(() => {
    history.push({
      pathname: `/pool/nominations/${address}`,
      state: { api, balances, claimable, consts, pathname, pool, redeemable, stakingConsts, unlockingAmount }
    });
  }, [history, address, api, balances, claimable, consts, pool, pathname, redeemable, unlockingAmount, stakingConsts]);

  const goToInfo = useCallback(() => {
    setShowInfo(true);
  }, []);

  const goToPool = useCallback(() => {
    history.push({
      pathname: `/pool/myPool/${address}`,
      state: { api, pool }
    });
  }, [address, api, history, pool]);

  const goToRewardWithdraw = useCallback(() => {
    claimable && !claimable?.isZero() && setShowRewardWithdraw(true);
  }, [claimable]);

  const goToRewardStake = useCallback(() => {
    claimable && !claimable?.isZero() && setShowRewardStake(true);
  }, [claimable]);

  const goToRedeemableWithdraw = useCallback(() => {
    redeemable && !redeemable?.isZero() && setShowRedeemableWithdraw(true);
  }, [redeemable]);

  const ToBeReleased = () => (
    <Grid container sx={{ borderTop: '1px solid', borderTopColor: 'secondary.main', fontSize: '16px', fontWeight: 500, ml: '7%', mt: '10px', width: '93%' }}>
      <Grid item pt='10px' xs={12}>
        {t('To be released')}
      </Grid>
      {toBeReleased?.map(({ amount, date }) => (
        <Grid container item key={date} spacing='15px' sx={{ fontSize: '16px', fontWeight: 500 }}>
          <Grid fontWeight={300} item>
            {new Date(date).toLocaleDateString(undefined, DATE_OPTIONS)}
          </Grid>
          <Grid fontWeight={400} item>
            <FormatBalance api={api} value={amount} />
          </Grid>
        </Grid>))
      }
    </Grid>
  );

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader page='stake' />
      <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', display: 'block', height: 'calc(100vh - 70px)', maxWidth: '1282px', overflow: 'scroll', px: '5%' }}>
        <Title
          logo={
            <PoolStakingIcon color={theme.palette.text.primary} height={60} width={60} />}
          text={t('Staked in Pool')}
        />
        <Grid container item justifyContent='space-between' mb='15px'>
          <Grid container direction='column' item mb='10px' minWidth='735px' rowGap='10px' width='calc(100% - 300px - 3%)'>
            <Grid container maxHeight={window.innerHeight - 264} sx={{ overflowY: 'scroll' }}>
              <DisplayBalance
                actions={[t('unstake')]}
                address={address}
                amount={staked}
                icons={[faMinus]}
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
