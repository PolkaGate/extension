// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { PoolStakingConsts } from '../../../util/types';

import { faHandDots, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Container, Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useLocation, useNavigate } from 'react-router-dom';

import { BN, BN_ZERO } from '@polkadot/util';

import { ActionContext, FormatBalance, FormatBalance2, HorizontalMenuItem, Identicon, ShowBalance, VaadinIcon } from '../../../components';
import { useApi, useBalances, useChain, useDecimal, useFormatted, useMyAccountIdentity, usePool, usePoolConsts, useStakingConsts, useToken, useTranslation, useUnSupportedNetwork } from '../../../hooks';
import useIsExtensionPopup from '../../../hooks/useIsExtensionPopup';
import { ChainSwitch, HeaderBrand } from '../../../partials';
import BouncingSubTitle from '../../../partials/BouncingSubTitle';
import { BALANCES_VALIDITY_PERIOD, DATE_OPTIONS, STAKING_CHAINS, TIME_TO_SHAKE_ICON } from '../../../util/constants';
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

export default function Index(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);
  const navigate = useNavigate();
  const { pathname, state } = useLocation();
  const { address } = useParams<{ address: string }>();
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const api = useApi(address, state?.api);
  const onExtension = useIsExtensionPopup();

  useUnSupportedNetwork(address, STAKING_CHAINS);

  const [refresh, setRefresh] = useState<boolean>(false);
  const pool = usePool(address, undefined, refresh);
  const stakingConsts = useStakingConsts(address, state?.stakingConsts);
  const consts = usePoolConsts(address, state?.poolConsts);
  const balances = useBalances(address, refresh, setRefresh);
  const identity = useMyAccountIdentity(address);

  const _judgement = identity && JSON.stringify(identity.judgements).match(/reasonable|knownGood/gi);
  const token = useToken(address);
  const decimal = useDecimal(address);

  const staked = useMemo(() => pool === undefined ? undefined : new BN(pool?.member?.points ?? 0), [pool]);
  const claimable = useMemo(() => pool === undefined ? undefined : new BN(pool?.myClaimable ?? 0), [pool]);
  const isPoolInfoOutdated = useMemo(() => pool?.date && (Date.now() - pool.date) > BALANCES_VALIDITY_PERIOD, [pool]);

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
    api?.derive.session?.progress().then((sessionInfo) => {
      setSessionInfo({
        currentEra: Number(sessionInfo.currentEra),
        eraLength: Number(sessionInfo.eraLength),
        eraProgress: Number(sessionInfo.eraProgress)
      });
    }).catch(console.error);
  }, [api]);

  useEffect((): void => {
    api?.query['staking']?.['currentEra']().then((ce) => {
      setCurrentEraIndex(Number(ce));
    }).catch(console.error);
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
    navigate(`/pool/stake/${address}`, { state: { api, consts, pathname, pool, stakingConsts } });
  }, [address, api, consts, navigate, pool, pathname, stakingConsts]);

  const goToUnstake = useCallback(() => {
    staked && !staked?.isZero() && navigate(`/pool/unstake/${address}`, {
      state: { api, balances, claimable, consts, pathname, pool, redeemable, stakingConsts, unlockingAmount }
    });
  }, [staked, navigate, address, api, balances, claimable, consts, pathname, pool, redeemable, stakingConsts, unlockingAmount]);

  const goToNominations = useCallback(() => {
    navigate(`/pool/nominations/${address}`, {
      state: { api, balances, claimable, consts, pathname, pool, redeemable, stakingConsts, unlockingAmount }
    });
  }, [navigate, address, api, balances, claimable, consts, pool, pathname, redeemable, unlockingAmount, stakingConsts]);

  const goToInfo = useCallback(() => {
    setShowInfo(true);
  }, []);

  const goToPool = useCallback(() => {
    navigate(`/pool/myPool/${address}`, {
      state: { api, pool }
    });
  }, [address, api, navigate, pool]);

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
    <Grid container sx={{ borderTop: '1px solid', borderTopColor: 'secondary.light', fontSize: '16px', fontWeight: 500, ml: '7%', mt: '10px', width: '93%' }}>
      <Grid item pt='10px' xs={12}>
        {t('To be released')}
      </Grid>
      {toBeReleased?.map(({ amount, date }) => (
        <Grid container item key={date} spacing='15px' sx={{ fontSize: '16px', fontWeight: 500 }}>
          <Grid fontWeight={300} item>
            {new Date(date).toLocaleDateString(undefined, DATE_OPTIONS)}
          </Grid>
          <Grid fontWeight={400} item>
            <FormatBalance api={api as ApiPromise} value={amount} />
          </Grid>
        </Grid>))
      }
    </Grid>
  );

  const Row = ({ isUnstaking, label, link1Text, link2Text, onLink1, onLink2, showDivider = true, value }: { label: string, value: BN | undefined, link1Text?: Text, onLink1?: () => void, link2Text?: Text, onLink2?: () => void, showDivider?: boolean, isUnstaking?: boolean }) => {
    return (
      <>
        <Grid alignItems='center' container justifyContent='space-between' pt='10px'>
          <Grid item sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em', maxWidth: 'fit-content' }}>
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
                    {link1Text as unknown as string}
                  </Grid>
                }
                {link2Text &&
                  <>
                    <Grid alignItems='center' item justifyContent='center' mx='10px'>
                      <Divider orientation='vertical' sx={{ bgcolor: !value || value?.isZero() ? 'text.disabled' : 'text.primary', height: '19px', mt: '3px', width: '2px' }} />
                    </Grid>
                    <Grid item onClick={onLink2} sx={{ color: !value || value?.isZero() ? 'text.disabled' : 'inherit', cursor: 'pointer', textDecorationLine: 'underline' }}>
                      {link2Text as unknown as string}
                    </Grid>
                  </>
                }
              </Grid>
            </Grid>
            {isUnstaking &&
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
        {isUnstaking && showUnlockings && !!toBeReleased?.length &&
          <ToBeReleased />
        }
        {showDivider &&
          <Grid container item justifyContent='center' xs={12}>
            <Divider sx={{ bgcolor: 'divider', mt: '10px', width: '100%' }} />
          </Grid>
        }
      </>
    );
  };

  const identicon = (
    <Identicon
      iconTheme={chain?.icon || 'polkadot'}
      isSubId={!!identity?.displayParent}
      judgement={_judgement}
      prefix={chain?.ss58Format ?? 42}
      size={40}
      value={formatted}
    />
  );

  return (
    <>
      <HeaderBrand
        _centerItem={<ChainSwitch address={address}>{identicon}</ChainSwitch>}
        noBorder
        onBackClick={onBackClick}
        paddingBottom={0}
        showBackArrow
        showClose
      />
      <Container disableGutters sx={{ px: '15px' }}>
        <AccountBrief address={address} identity={identity} />
        <BouncingSubTitle circleStyle={{ margin: '17px 0 0 149px' }} label={t<string>('Pool Staking')} refresh={refresh} />
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
            isUnstaking
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
      <Grid container justifyContent='space-around' sx={{ borderTop: '2px solid', borderTopColor: 'secondary.light', bottom: 0, left: '4%', position: 'absolute', pt: '5px', pb: '3px', width: '92%' }}>
        <HorizontalMenuItem
          divider
          icon={
            <FontAwesomeIcon
              color={`${theme.palette.text.primary}`}
              icon={faPlus}
              shake={shake}
              style={{ height: '34px', marginBottom: '-4px', stroke: `${theme.palette.text.primary}`, strokeWidth: 30, width: '40px' }}
            />
          }
          onClick={goToStake}
          title={t<string>('Stake')}
        />
        <HorizontalMenuItem
          divider
          icon={
            <FontAwesomeIcon
              bounce={staked !== undefined && !staked.isZero() && (pool?.bondedPool?.state as unknown as string) !== 'Destroying' && pool?.stashIdAccount?.nominators?.length === 0} // do when has stake but does not nominations
              color={`${theme.palette.text.primary}`}
              icon={faHandDots}
              size='lg'
            />
          }
          onClick={goToNominations}
          title={t<string>('Validators')}
        />
        <HorizontalMenuItem
          divider
          // @ts-ignore
          icon={<VaadinIcon icon='vaadin:grid-small' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />}
          onClick={goToPool}
          title={t<string>('Pool')}
        />
        <HorizontalMenuItem
          // @ts-ignore
          icon={<VaadinIcon icon='vaadin:info-circle' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />}
          onClick={goToInfo}
          title={t<string>('Info')}
        />
      </Grid>
      <Info
        address={address}
        info={consts as PoolStakingConsts}
        setShowInfo={setShowInfo}
        showInfo={showInfo}
      />
      {showRewardStake && formatted && api && claimable && staked && chain &&
        <RewardsStakeReview
          address={address}
          amount={claimable}
          api={api}
          chain={chain as any}
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
          available={getValue('available', balances) as BN}
          chain={chain as any}
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
          available={getValue('available', balances) as BN}
          chain={chain as any}
          formatted={formatted}
          setRefresh={setRefresh}
          setShow={setShowRedeemableWithdraw}
          show={showRedeemableWithdraw}
        />}
    </>
  );
}
