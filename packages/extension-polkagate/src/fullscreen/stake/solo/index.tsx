// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { PoolStakingConsts, StakingConsts } from '../../../util/types';

import { faBolt, faCircleDown, faClockFour, faHand, faInfoCircle, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon, Boy as BoyIcon } from '@mui/icons-material';
import { Box, Container, Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { getValue } from '@polkadot/extension-polkagate/src/popup/account/util';
import { BN, BN_ZERO } from '@polkadot/util';

import { controllerSettingBlack, controllerSettingWhite, soloSettingBlack, soloSettingWhite, stashSettingBlack, stashSettingWhite } from '../../../assets/icons';
import { ActionContext, FormatBalance, HorizontalMenuItem, Identicon, ShowBalance } from '../../../components';
import { useActiveValidators, useApi, useBalances, useChain, useDecimal, useFormatted, useFullscreen, useInfo, useMyAccountIdentity, useNativeTokenPrice, useStakingAccount, useStakingConsts, useStakingRewardDestinationAddress, useStakingRewards, useToken, useTranslation, useUnSupportedNetwork } from '../../../hooks';
import useIsExtensionPopup from '../../../hooks/useIsExtensionPopup';
import { BALANCES_VALIDITY_PERIOD, DATE_OPTIONS, STAKING_CHAINS, TIME_TO_SHAKE_ICON } from '../../../util/constants';
import { FullScreenHeader } from '../../governance/FullScreenHeader';
import { Title } from '../../sendFund/InputPage';
import DisplayBalance from '../partials/DisplayBalance';
import ActiveValidators from './partials/ActiveValidators';
import RewardsChart from './partials/RewardsChart';
import ShowValidator from './partials/ShowValidator';

// import RewardsDetail from './rewards/RewardsDetail';
// import Info from './Info';
// import RedeemableWithdrawReview from './redeem';
// import Settings from './settings';

interface SessionIfo {
  eraLength: number;
  eraProgress: number;
  currentEra: number;
}

export default function Index (): React.ReactElement {
  const { t } = useTranslation();

  useFullscreen();

  const history = useHistory();
  const { address } = useParams<{ address: string }>();

  useUnSupportedNetwork(address, STAKING_CHAINS);

  const [refresh, setRefresh] = useState<boolean>(false);
  const stakingAccount = useStakingAccount(address, undefined, refresh, setRefresh);
  const rewardDestinationAddress = useStakingRewardDestinationAddress(stakingAccount);

  const rewards = useStakingRewards(address, stakingAccount);
  const { api } = useInfo(address);
  const stakingConsts = useStakingConsts(address);
  const balances = useBalances(address, refresh, setRefresh);

  
  const redeemable = useMemo(() => stakingAccount?.redeemable, [stakingAccount?.redeemable]);
  const staked = useMemo(() => stakingAccount?.stakingLedger?.active, [stakingAccount?.stakingLedger?.active]);
  const availableToSoloStake = balances?.freeBalance && staked && balances.freeBalance.sub(staked);

  const [unlockingAmount, setUnlockingAmount] = useState<BN | undefined>();
  const [sessionInfo, setSessionInfo] = useState<SessionIfo>();
  const [toBeReleased, setToBeReleased] = useState<{ date: number, amount: BN }[]>();
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showRedeemableWithdraw, setShowRedeemableWithdraw] = useState<boolean>(false);

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
    history.push({
      pathname: `/solo/unstake/${address}`,
      state: { api, balances, redeemable, stakingAccount, stakingConsts, unlockingAmount }
    });
  }, [history, address, api, balances, redeemable, stakingConsts, unlockingAmount, stakingAccount]);

  const onFastUnstake = useCallback(() => {
    history.push({
      pathname: `/solo/fastUnstake/${address}`,
      state: { api, balances, redeemable, stakingAccount, stakingConsts, unlockingAmount }
    });
  }, [address, api, balances, history, redeemable, stakingAccount, stakingConsts, unlockingAmount]);

  const onPendingRewards = useCallback(() => {
    history.push({
      pathname: `/solo/payout/${address}`,
      state: {}
    });
  }, [address, history]);

  const onRedeemableWithdraw = useCallback(() => {
    redeemable && !redeemable?.isZero() && setShowRedeemableWithdraw(true);
  }, [redeemable]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader page='stake' />
      <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', display: 'block', height: 'calc(100vh - 70px)', maxWidth: '1282px', overflow: 'scroll', px: '5%' }}>
        <Title logo={ <BoyIcon sx={{ color: 'text.primary', fontSize: '60px' }} /> } text={t('Staked Solo')} />
        <Grid container item justifyContent='space-between' mb='15px'>
          <Grid container direction='column' item mb='10px' minWidth='715px' rowGap='10px' width='calc(100% - 300px - 3%)'>
            <Grid container maxHeight={window.innerHeight - 264} sx={{ overflowY: 'scroll' }}>
              <DisplayBalance
                actions={[t('unstake'), t('fast unstake')]}
                address={address}
                amount={staked}
                icons={[faMinus, faBolt]}
                marginTop='0px'
                onClicks={[onUnstake, api && api.consts?.fastUnstake?.deposit && onFastUnstake]}
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
                address={address}
                amount={unlockingAmount}
                isUnstaking
                title={t('Unstaking')}
                toBeReleased={toBeReleased}
              />
              <DisplayBalance
                actions={[t('stake')]}
                address={address}
                amount={availableToSoloStake}
                icons={[faPlus]}
                onClicks={[onUnstake]} // TODO
                title={t('Available to stake')}
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
          </Grid>
        </Grid>
        {/* <Grid container justifyContent='space-around' sx={{ borderTop: '2px solid', borderTopColor: 'secondary.main', bottom: 0, left: '4%', position: 'absolute', pt: '5px', pb: '2px', width: '92%' }}>
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
        </Grid> */}
      </Grid>
      {/* <Info
        address={address}
        info={stakingConsts}
        setShowInfo={setShowInfo}
        showInfo={showInfo}
      /> */}
      {/* {showSettings && stakingAccount &&
        <Settings
          address={address}
          api={api}
          setRefresh={setRefresh}
          setShowSettings={setShowSettings}
          showSettings={showSettings}
          stakingAccount={stakingAccount}
          stakingConsts={stakingConsts}
        />
      } */}
      {/* {showRedeemableWithdraw && formatted && api && getValue('available', balances) && chain && redeemable && !redeemable?.isZero() &&
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
        />} */}
      {/* {showRewardsDetail &&
        <RewardsDetail
          address={address}
          rewardDestinationAddress={rewardDestinationAddress}
          setShow={setShowRewardsDetail}
          show={showRewardsDetail}
        />
      } */}
    </Grid>
  );
}
