// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { PoolStakingConsts, StakingConsts } from '../../../util/types';

import { faHand, faInfoCircle, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Box, Container, Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { BN, BN_ZERO } from '@polkadot/util';

import { controllerSettingBlack, controllerSettingWhite, soloSettingBlack, soloSettingWhite, stashSettingBlack, stashSettingWhite } from '../../../assets/icons';
import { ActionContext, FormatBalance, HorizontalMenuItem, Identicon, ShowBalance } from '../../../components';
import { useApi, useBalances, useChain, useDecimal, useFormatted, useMyAccountIdentity, useStakingAccount, useStakingConsts, useStakingRewardDestinationAddress, useStakingRewards, useToken, useTranslation, useUnSupportedNetwork } from '../../../hooks';
import { ChainSwitch, HeaderBrand } from '../../../partials';
import BouncingSubTitle from '../../../partials/BouncingSubTitle';
import { BALANCES_VALIDITY_PERIOD, DATE_OPTIONS, STAKING_CHAINS, TIME_TO_SHAKE_ICON } from '../../../util/constants';
import AccountBrief from '../../account/AccountBrief';
import { getValue } from '../../account/util';
import RewardsDetail from './rewards/RewardsDetail';
import Info from './Info';
import RedeemableWithdrawReview from './redeem';
import Settings from './settings';

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

const noop = () => null;

export default function Index(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const theme = useTheme();
  const history = useHistory();
  const { pathname, state } = useLocation<State>();
  const { address } = useParams<{ address: string }>();
  const formatted = useFormatted(address);

  useUnSupportedNetwork(address, STAKING_CHAINS);

  const [refresh, setRefresh] = useState<boolean>(false);
  const stakingAccount = useStakingAccount(address, state?.stakingAccount, refresh, setRefresh);
  const rewardDestinationAddress = useStakingRewardDestinationAddress(stakingAccount);
  const chain = useChain(address);
  const rewards = useStakingRewards(address, stakingAccount);
  const api = useApi(address, state?.api);
  const stakingConsts = useStakingConsts(address, state?.stakingConsts);
  const balances = useBalances(address, refresh, setRefresh);
  const identity = useMyAccountIdentity(address);
  const token = useToken(address);
  const decimal = useDecimal(address);
  const _judgement = identity && JSON.stringify(identity.judgements).match(/reasonable|knownGood/gi);

  const role = useCallback((): string =>
    String(stakingAccount?.controllerId) === String(stakingAccount?.stashId)
      ? 'Both'
      : String(formatted) === String(stakingAccount?.stashId)
        ? 'Stash'
        : String(formatted) === String(stakingAccount?.controllerId)
          ? 'Controller'
          : 'undefined' // default
    , [formatted, stakingAccount?.controllerId, stakingAccount?.stashId]);

  const canStake = ['Both', 'Stash'].includes(role());
  const canUnstake = ['Both', 'Controller'].includes(role());

  const redeemable = useMemo(() => stakingAccount?.redeemable, [stakingAccount?.redeemable]);
  const staked = useMemo(() => stakingAccount?.stakingLedger?.active, [stakingAccount?.stakingLedger?.active]);
  const availableToSoloStake = balances?.freeBalance && staked && balances.freeBalance.sub(staked);
  const isBalanceOutdated = useMemo(() => stakingAccount && (Date.now() - (stakingAccount.date || 0)) > BALANCES_VALIDITY_PERIOD, [stakingAccount]);

  const [unlockingAmount, setUnlockingAmount] = useState<BN | undefined>(state?.unlockingAmount);
  const [sessionInfo, setSessionInfo] = useState<SessionIfo>();
  const [toBeReleased, setToBeReleased] = useState<{ date: number, amount: BN }[]>();
  const [showUnlockings, setShowUnlockings] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showRedeemableWithdraw, setShowRedeemableWithdraw] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false); //  to shake to persuade to stake ;)
  const [showRewardsDetail, setShowRewardsDetail] = useState<boolean>(false);

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

  useEffect(() => {
    if (stakingAccount?.stakingLedger?.active?.isZero()) {
      setShake(true);
      setTimeout(() => setShake(false), TIME_TO_SHAKE_ICON);
    }
  }, [stakingAccount?.stakingLedger.active]);

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

  const onBackClick = useCallback(() => {
    const url = chain?.genesisHash ? `/account/${chain.genesisHash}/${address}/` : '/';

    onAction(url);
  }, [address, chain?.genesisHash, onAction]);

  const onStake = useCallback(() => {
    history.push({
      pathname: `/solo/stake/${address}`,
      state: { api, pathname, stakingConsts }
    });
  }, [address, api, history, pathname, stakingConsts]);

  const onUnstake = useCallback(() => {
    history.push({
      pathname: `/solo/unstake/${address}`,
      state: { api, balances, pathname, redeemable, stakingAccount, stakingConsts, unlockingAmount }
    });
  }, [history, address, api, balances, pathname, redeemable, stakingConsts, unlockingAmount, stakingAccount]);

  const onFastUnstake = useCallback(() => {
    history.push({
      pathname: `/solo/fastUnstake/${address}`,
      state: { api, balances, pathname, redeemable, stakingAccount, stakingConsts, unlockingAmount }
    });
  }, [address, api, balances, history, pathname, redeemable, stakingAccount, stakingConsts, unlockingAmount]);

  const onRestake = useCallback(() => {
    history.push({
      pathname: `/solo/restake/${address}`,
      state: { api, balances, pathname, stakingAccount, stakingConsts, unlockingAmount }
    });
  }, [history, address, api, balances, pathname, stakingConsts, unlockingAmount, stakingAccount]);

  const onNominations = useCallback(() => {
    history.push({
      pathname: `/solo/nominations/${address}`,
      state: { api, balances, pathname, redeemable, stakingAccount, stakingConsts, unlockingAmount }
    });
  }, [history, address, api, balances, pathname, redeemable, stakingAccount, stakingConsts, unlockingAmount]);

  const onInfo = useCallback(() => {
    setShowInfo(true);
  }, []);

  const onSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  const onRedeemableWithdraw = useCallback(() => {
    redeemable && !redeemable?.isZero() && setShowRedeemableWithdraw(true);
  }, [redeemable]);

  const onReceivedRewards = useCallback(() => {
    !rewards?.isZero() &&
      setShowRewardsDetail(true);
  }, [rewards]);

  const onPendingRewards = useCallback(() => {
    history.push({
      pathname: `/solo/payout/${address}`,
      state: {}
    });
  }, [address, history]);

  const ToBeReleased = () => (
    <Grid container sx={{ borderTop: '1px solid', borderTopColor: 'secondary.main', fontSize: '16px', fontWeight: 500, ml: '7%', mt: '2px', width: '95%' }}>
      <Grid item pt='10px' xs={12}>
        {t('To be released')}
      </Grid>
      {toBeReleased?.map(({ amount, date }) => (
        <Grid container item key={date} spacing='15px' sx={{ fontSize: '16px', fontWeight: 500 }}>
          <Grid fontWeight={300} item>
            {new Date(date).toLocaleDateString(undefined, DATE_OPTIONS)}
          </Grid>
          <Grid fontWeight={400} item>
            <FormatBalance api={api} decimalPoint={4} value={amount} />
          </Grid>
        </Grid>))
      }
    </Grid>
  );

  const Row = ({ label, link1Text, link2Disabled, link2Text, onLink1, onLink2, showDivider = true, value }: { label: string, value: BN | undefined, link1Text?: string, onLink1?: () => void, link2Disabled?: boolean, link2Text?: string, onLink2?: () => void, showDivider?: boolean }) => {
    const _link1Disable = (!value || value?.isZero() || formatted !== stakingAccount?.controllerId) && link1Text !== t('Pending');
    const _link2Disable = _link1Disable || link2Disabled;

    return (
      <>
        <Grid alignItems='center' container justifyContent='space-between' pt='10px'>
          <Grid item sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em' }} xs={5}>
            {label}
          </Grid>
          <Grid container item justifyContent='flex-end' xs>
            <Grid alignItems='flex-end' container direction='column' item xs>
              <Grid item sx={{ color: isBalanceOutdated ? 'primary.light' : 'text.primary', fontSize: '20px', fontWeight: 400, lineHeight: '20px' }} >
                <ShowBalance api={api} balance={value} decimal={decimal} decimalPoint={4} token={token} />
              </Grid>
              <Grid container item justifyContent='flex-end' sx={{ fontSize: '16px', fontWeight: 400, letterSpacing: '-0.015em' }}>
                {link1Text &&
                  <Grid item onClick={_link1Disable ? noop : onLink1} sx={{ color: _link1Disable ? 'text.disabled' : 'inherit', cursor: 'pointer', letterSpacing: '-0.015em', lineHeight: '36px', textDecorationLine: 'underline' }} >
                    {link1Text}
                  </Grid>
                }
                {link2Text &&
                  <>
                    <Grid alignItems='center' item justifyContent='center' mx='6px'>
                      <Divider orientation='vertical' sx={{ bgcolor: _link2Disable ? 'text.disabled' : 'text.primary', height: '19px', mt: '10px', width: '2px' }} />
                    </Grid>
                    <Grid item onClick={_link2Disable ? noop : onLink2} sx={{ color: _link2Disable ? 'text.disabled' : 'inherit', cursor: 'pointer', letterSpacing: '-0.015em', lineHeight: '36px', textDecorationLine: 'underline' }} >
                      {link2Text}
                    </Grid>
                  </>
                }
              </Grid>
            </Grid>
            {label === 'Unstaking' &&
              <Grid alignItems='center' container item onClick={toBeReleased?.length ? _toggleShowUnlockings : noop} sx={{ ml: '25px' }} xs={1}>
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
            <Divider sx={{ bgcolor: 'secondary.main', m: '2px auto', width: '100%' }} />
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
      value={String(formatted)}
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
        <BouncingSubTitle circleStyle={{ m: '17px 0 0 149px' }} label={t<string>('Solo Staking')} refresh={refresh} style={{ fontSize: '20px', fontWeight: 400 }} />
        <Grid container maxHeight={window.innerHeight - 260} sx={{ overflowY: 'scroll' }}>
          <Row
            label={t('Staked')}
            link1Text={t('Unstake')}
            link2Disabled={!api || (api && !api.consts?.fastUnstake?.deposit) || !canUnstake}
            link2Text={t('Fast Unstake')}
            onLink1={onUnstake}
            onLink2={api && api.consts?.fastUnstake?.deposit && onFastUnstake}
            value={staked}
          />
          <Row
            label={t('Rewards Paid')}
            link1Text={t('Chart')}
            link2Text={t('Pending')}
            onLink1={onReceivedRewards}
            onLink2={onPendingRewards}
            value={rewards}
          />
          <Row
            label={t('Redeemable')}
            link1Text={t('Withdraw')}
            onLink1={onRedeemableWithdraw}
            value={redeemable}
          />
          <Row
            label={t('Unstaking')}
            link1Text={t('Restake')}
            onLink1={unlockingAmount && !unlockingAmount?.isZero() ? onRestake : noop}
            showDivider={canStake}
            value={unlockingAmount}

          />
          {canStake &&
            <Row
              label={t('Available to Stake')}
              showDivider={false}
              value={availableToSoloStake}
            />
          }
        </Grid>
      </Container>
      <Grid container justifyContent='space-around' sx={{ borderTop: '2px solid', borderTopColor: 'secondary.main', bottom: 0, left: '4%', position: 'absolute', pt: '5px', pb: '2px', width: '92%' }}>
        <HorizontalMenuItem
          divider
          icon={
            <FontAwesomeIcon
              color={`${theme.palette.text.primary}`}
              icon={faPlus}
              shake={shake}
              style={{ height: '34px', stroke: `${theme.palette.text.primary}`, strokeWidth: 30, width: '40px', marginBottom: '-4px' }}
            />
          }
          onClick={onStake}
          textDisabled={role() === 'Controller'}
          title={t<string>('Stake')}
        />
        <HorizontalMenuItem
          divider
          icon={
            <FontAwesomeIcon
              bounce={stakingAccount !== undefined && !stakingAccount?.nominators.length && !stakingAccount?.stakingLedger.active.isZero()} // do when has stake but does not nominations
              color={`${theme.palette.text.primary}`}
              icon={faHand}
              size='lg'
            />
          }
          onClick={onNominations}
          // textDisabled={role() === 'Stash'}
          title={t<string>('Validators')}
        />
        {stakingAccount?.stakingLedger?.total?.gt(BN_ZERO) &&
          <HorizontalMenuItem
            divider
            icon={
              <Box
                component='img'
                src={
                  (['Both', 'undefined'].includes(role())
                    ? (theme.palette.mode === 'dark' ? soloSettingWhite : soloSettingBlack)
                    : role() === 'Stash'
                      ? (theme.palette.mode === 'dark' ? stashSettingWhite : stashSettingBlack)
                      : (role() === 'Controller' && theme.palette.mode === 'dark')
                        ? controllerSettingWhite
                        : controllerSettingBlack
                  ) as string
                }
              />
            }
            labelMarginTop={'-7px'}
            onClick={onSettings}
            title={t<string>('Setting')}
          />
        }
        <HorizontalMenuItem
          icon={
            <FontAwesomeIcon
              color={`${theme.palette.text.primary}`}
              icon={faInfoCircle}
              size='lg'
            />
          }
          onClick={onInfo}
          title={t<string>('Info')}
        />
      </Grid>
      <Info
        address={address}
        info={stakingConsts}
        setShowInfo={setShowInfo}
        showInfo={showInfo}
      />
      {showSettings && stakingAccount &&
        <Settings
          address={address}
          api={api}
          setRefresh={setRefresh}
          setShowSettings={setShowSettings}
          showSettings={showSettings}
          stakingAccount={stakingAccount}
          stakingConsts={stakingConsts}
        />
      }
      {showRedeemableWithdraw && formatted && api && getValue('available', balances) && chain && redeemable && !redeemable?.isZero() &&
        <RedeemableWithdrawReview
          address={address}
          amount={redeemable}
          api={api}
          available={getValue('available', balances)}
          chain={chain}
          formatted={String(formatted)}
          setRefresh={setRefresh}
          setShow={setShowRedeemableWithdraw}
          show={showRedeemableWithdraw}
        />}
      {showRewardsDetail &&
        <RewardsDetail
          address={address}
          rewardDestinationAddress={rewardDestinationAddress}
          setShow={setShowRewardsDetail}
          show={showRewardsDetail}
        />
      }
    </>
  );
}
