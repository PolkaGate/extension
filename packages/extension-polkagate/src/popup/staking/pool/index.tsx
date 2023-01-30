// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { PoolStakingConsts, StakingConsts } from '../../../util/types';

import { faHand, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Container, Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { BN, BN_ZERO } from '@polkadot/util';

import { ActionContext, FormatBalance, FormatBalance2, HorizontalMenuItem, Identicon, ShowBalance } from '../../../components';
import { useApi, useBalances, useChain, useDecimal, useFormatted, useMyAccountIdentity, usePool, usePoolConsts, useStakingConsts, useToken, useTranslation } from '../../../hooks';
import { HeaderBrand } from '../../../partials';
import BouncingSubTitle from '../../../partials/BouncingSubTitle';
import { BALANCES_VALIDITY_PERIOD, DATE_OPTIONS, TIME_TO_SHAKE_STAKE_ICON } from '../../../util/constants';
import AccountBrief from '../../account/AccountBrief';
import { getValue } from '../../account/util';
import RewardsStakeReview from './rewards/Stake';
import RewardsWithdrawReview from './rewards/Withdraw';
import Info from './Info';
import RedeemableWithdrawReview from './redeem';

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

export default function Index(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const theme = useTheme();
  const history = useHistory();
  const { pathname, state } = useLocation<State>();
  const { address } = useParams<{ address: string }>();
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const api = useApi(address, state?.api);
  const [refresh, setRefresh] = useState<boolean>(false);
  const pool = usePool(address, undefined, refresh);
  const stakingConsts = useStakingConsts(address, state?.stakingConsts);
  const consts = usePoolConsts(address, state?.poolConsts);
  const balances = useBalances(address, refresh, setRefresh);
  const identity = useMyAccountIdentity(address);

  const token = useToken(address);
  const decimal = useDecimal(address);

  // const staked = useMemo(() => !pool?.member?.points ? undefined : pool.member.points === 0 ? BN_ZERO : (new BN(String(pool.member.points)).mul(new BN(String(pool.stashIdAccount.stakingLedger.active)))).div(new BN(String(pool.bondedPool.points ?? BN_ONE))), [pool]);

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
      setTimeout(() => setShake(false), TIME_TO_SHAKE_STAKE_ICON);
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
  }, [pool, api, currentEraIndex, sessionInfo]);

  const onBackClick = useCallback(() => {
    const url = chain?.genesisHash ? `/account/${chain.genesisHash}/${address}/` : '/';

    onAction(url);
  }, [address, chain?.genesisHash, onAction]);

  const goToStake = useCallback(() => {
    history.push({
      pathname: `/pool/stake/${address}`,
      state: { api, consts, pathname, pool, stakingConsts }
    });
  }, [address, api, consts, history, pool, pathname, stakingConsts]);

  const goToUnstake = useCallback(() => {
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

  const Row = ({ label, link1Text, link2Text, onLink1, onLink2, showDivider = true, value }: { label: string, value: BN | undefined, link1Text?: Text, onLink1?: () => void, link2Text?: Text, onLink2?: () => void, showDivider?: boolean }) => {
    return (
      <>
        <Grid alignItems='center' container justifyContent='space-between' pt='10px'>
          <Grid item sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em' }} xs={5}>
            {label}
          </Grid>
          <Grid container item justifyContent='flex-end' xs>
            <Grid alignItems='flex-end' container direction='column' item xs>
              <Grid item sx={{ color: isPoolInfoOutdated ? 'primary.light' : 'text.primary', fontSize: '20px', fontWeight: 400, lineHeight: '20px' }} >
                {value && token && decimal
                  ? <FormatBalance2 decimals={[decimal]} tokens={[token]} value={value} />
                  : <ShowBalance api={api} balance={value} />
                }
              </Grid>
              <Grid alignItems='center' container item justifyContent='flex-end' sx={{ fontSize: '16px', fontWeight: 400, mt: '5px' }}>
                {link1Text &&
                  <Grid item onClick={onLink1} sx={{ color: !value || value?.isZero() ? 'text.disabled' : 'inherit', cursor: 'pointer', textDecorationLine: 'underline' }} >
                    {link1Text}
                  </Grid>
                }
                {link2Text &&
                  <>
                    <Grid alignItems='center' item justifyContent='center' mx='10px'>
                      <Divider orientation='vertical' sx={{ bgcolor: !value || value?.isZero() ? 'text.disabled' : 'text.primary', height: '19px', mt: '3px', width: '2px' }} />
                    </Grid>
                    <Grid item onClick={onLink2} sx={{ color: !value || value?.isZero() ? 'text.disabled' : 'inherit', cursor: 'pointer', textDecorationLine: 'underline' }}>
                      {link2Text}
                    </Grid>
                  </>
                }
              </Grid>
            </Grid>
            {label === 'Unstaking' &&
              <Grid alignItems='center' container item onClick={_toggleShowUnlockings} sx={{ ml: '25px' }} xs={1}>
                <ArrowForwardIosIcon
                  sx={{
                    color: !toBeReleased?.length ? 'text.disabled' : 'secondary.light',
                    cursor: 'pointer',
                    fontSize: 18,
                    m: 'auto',
                    stroke: !toBeReleased?.length ? 'text.disabled' : 'secondary.light',
                    strokeWidth: '2px',
                    transform: showUnlockings ? 'rotate(-90deg)' : 'rotate(90deg)'
                  }}
                />
              </Grid>
            }
          </Grid>
        </Grid>
        {label === 'Unstaking' && showUnlockings && !!toBeReleased?.length &&
          <ToBeReleased />
        }
        {showDivider &&
          <Grid container item justifyContent='center' xs={12}>
            <Divider sx={{ bgcolor: 'secondary.main', mt: '10px', width: '100%' }} />
          </Grid>
        }
      </>
    );
  };

  const identicon = (
    <Identicon
      iconTheme={chain?.icon || 'polkadot'}
      judgement={identity?.judgements}
      prefix={chain?.ss58Format ?? 42}
      size={40}
      value={formatted}
    />
  );

  return (
    <>
      <HeaderBrand
        _centerItem={identicon}
        noBorder
        onBackClick={onBackClick}
        paddingBottom={0}
        showBackArrow
        showClose
      />
      <Container disableGutters sx={{ px: '15px' }}>
        <AccountBrief address={address} identity={identity} />
        <BouncingSubTitle circleStyle={{ m: '17px 0 0 149px' }} label={t<string>('Pool Staking')} refresh={refresh} style={{ fontSize: '20px', fontWeight: 400 }} />
        <Grid container maxHeight={window.innerHeight - 264} sx={{ overflowY: 'scroll' }}>
          <Row
            label={t('Staked')}
            link1Text={t('Unstake')}
            onLink1={goToUnstake}
            value={staked}
          />
          <Row
            label={t('Rewards')}
            link1Text={t('Withdraw')}
            link2Text={t('Stake')}
            onLink1={goToRewardWithdraw}
            onLink2={goToRewardStake}
            value={claimable}
          />
          <Row
            label={t('Redeemable')}
            link1Text={t('Withdraw')}
            onLink1={goToRedeemableWithdraw}
            value={redeemable}
          />
          <Row
            label={t('Unstaking')}
            value={unlockingAmount}
          />
          <Row
            label={t('Available to stake')}
            showDivider={false}
            value={getValue('available', balances)}
          />
        </Grid>
      </Container>
      <Grid container justifyContent='space-around' sx={{ borderTop: '2px solid', borderTopColor: 'secondary.main', bottom: 0, left: '4%', position: 'absolute', pt: '5px', pb: '3px', width: '92%' }}>
        <HorizontalMenuItem
          divider
          icon={
            <FontAwesomeIcon
              color={theme.palette.mode === 'dark' ? 'white' : 'black'}
              icon={faPlus}
              shake={shake}
              style={{ height: '34px', stroke: theme.palette.mode === 'dark' ? 'white' : 'black', strokeWidth: 30, width: '40px', marginBottom: '-4px' }}
            />
          }
          onClick={goToStake}
          title={t<string>('Stake')}
        />
        <HorizontalMenuItem
          divider
          icon={
            <FontAwesomeIcon
              bounce={staked !== undefined && !staked.isZero() && pool?.bondedPool?.state !== 'Destroying' && pool?.stashIdAccount?.nominators?.length === 0} // do when has stake but does not nominations
              color={theme.palette.mode === 'dark' ? 'white' : 'black'}
              icon={faHand}
              size='lg'
            />
          }
          onClick={goToNominations}
          title={t<string>('Validators')}
        />
        <HorizontalMenuItem
          divider
          icon={<vaadin-icon icon='vaadin:grid-small' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />}
          onClick={goToPool}
          title={t<string>('Pool')}
        />
        <HorizontalMenuItem
          icon={<vaadin-icon icon='vaadin:info-circle' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />}
          onClick={goToInfo}
          title={t<string>('Info')}
        />
      </Grid>
      <Info
        address={address}
        info={consts}
        setShowInfo={setShowInfo}
        showInfo={showInfo}
      />
      {showRewardStake && formatted && api && claimable && staked && chain &&
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
        />}
      {showRewardWithdraw && formatted && api && getValue('available', balances) && chain && claimable &&
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
        />}
      {showRedeemableWithdraw && formatted && api && getValue('available', balances) && chain && redeemable && !redeemable?.isZero() &&
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
        />}
    </>
  );
}
