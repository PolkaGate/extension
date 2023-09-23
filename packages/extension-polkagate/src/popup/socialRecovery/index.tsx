// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';
import type { PalletNominationPoolsPoolMember, PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ZERO } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { Warning } from '../../components';
import { useAccountsInfo, useActiveRecoveries, useApi, useChain, useFormatted, useFullscreen, useTranslation } from '../../hooks';
import { SOCIAL_RECOVERY_CHAINS } from '../../util/constants';
import getPoolAccounts from '../../util/getPoolAccounts';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import { FriendWithId } from './components/SelectTrustedFriend';
import RecoveryCheckProgress from './partial/RecoveryCheckProgress';
import { InitiateRecoveryConfig, RecoveryConfigType, SocialRecoveryModes, WithdrawInfo } from './util/types';
import Home from './Home';
import InitiateRecovery from './InitiateRecovery';
import RecoveryDetail from './RecoveryDetail';
import Review from './Review';
import RecoveryConfig from './SetRecoverable';
import Vouch from './VouchRecovery';

export const STEPS = {
  CHECK_SCREEN: 0,
  INDEX: 1,
  MAKE_RECOVERABLE: 2,
  MODIFY: 3,
  RECOVERY_DETAIL: 4,
  INITIATE_RECOVERY: 5,
  VOUCH: 6,
  REVIEW: 7,
  WAIT_SCREEN: 8,
  CONFIRM: 9,
  UNSUPPORTED: 10,
  PROXY: 100
};

interface SessionInfo {
  eraLength: number;
  eraProgress: number;
  currentEra: number;
}

export default function SocialRecovery(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();

  const { address, closeRecovery } = useParams<{ address: string, closeRecovery: string }>();
  const api = useApi(address);
  const theme = useTheme();
  const chain = useChain(address);
  const formatted = useFormatted(address);
  const accountsInfo = useAccountsInfo(api, chain);

  const indexBgColor = useMemo(() => theme.palette.mode === 'light' ? '#DFDFDF' : theme.palette.background.paper, [theme.palette.background.paper, theme.palette.mode]);
  const contentBgColor = useMemo(() => theme.palette.mode === 'light' ? '#F1F1F1' : theme.palette.background.default, [theme.palette.background.default, theme.palette.mode]);

  const [step, setStep] = useState<number>(STEPS.CHECK_SCREEN);
  const [recoveryInfo, setRecoveryInfo] = useState<PalletRecoveryRecoveryConfig | null | undefined>();
  const [recoveryConfig, setRecoveryConfig] = useState<RecoveryConfigType | undefined>();
  const [lostAccountAddress, setLostAccountAddress] = useState<InitiateRecoveryConfig | undefined>();
  const [vouchRecoveryInfo, setVouchRecoveryInfo] = useState<{ lost: FriendWithId, rescuer: FriendWithId } | undefined>();
  const [withdrawInfo, setWithdrawInfo] = useState<WithdrawInfo | undefined>();
  const [mode, setMode] = useState<SocialRecoveryModes>();
  const [totalDeposit, setTotalDeposit] = useState<BN>(BN_ZERO);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(false);
  const [activeProxy, setActiveProxy] = useState<string | null>();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>();
  const [lostAccountBalance, setLostAccountBalance] = useState<Balance | undefined>();
  const [lostAccountRedeemable, setLostAccountRedeemable] = useState<Balance | undefined>();
  const [lostAccountSoloStakingBalance, setLostAccountSoloStakingBalance] = useState<BN | undefined>();
  const [lostAccountPoolStakingBalance, setLostAccountPoolStakingBalance] = useState<BN | undefined>();
  const [lostAccountReserved, setLostAccountReserved] = useState<BN | undefined>();
  const [lostAccountSoloUnlock, setLostAccountSoloUnlock] = useState<{ amount: BN, date: number } | undefined>();
  const [lostAccountIdentity, setLostAccountIdentity] = useState<boolean | undefined>();
  const [alreadyClaimed, setAlreadyClaimed] = useState<boolean | undefined>();
  const [lostAccountRecoveryInfo, setLostAccountRecoveryInfo] = useState<PalletRecoveryRecoveryConfig | null | undefined | false>(false);
  const [fetchingLostAccountInfos, setFetchingLostAccountInfos] = useState<boolean>(false);

  const activeRecoveries = useActiveRecoveries(refresh ? undefined : api);

  const activeRescue = useMemo(() =>
    activeRecoveries && formatted
      ? activeRecoveries.filter((active) => active.rescuer === String(formatted)).at(-1) ?? null
      : activeRecoveries === null
        ? null
        : undefined
    , [activeRecoveries, formatted]);
  const activeLost = useMemo(() =>
    activeRecoveries && formatted
      ? activeRecoveries.filter((active) => active.lost === String(formatted)).at(-1) ?? null
      : activeRecoveries === null
        ? null
        : undefined
    , [activeRecoveries, formatted]);

  const buttonColors = useMemo(() =>
    activeLost
      ? theme.palette.secondary.contrastText
      : theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.secondary.light
    , [activeLost, theme.palette.mode, theme.palette.primary.main, theme.palette.secondary.contrastText, theme.palette.secondary.light]);

  useEffect(() => {
    chain?.genesisHash && !SOCIAL_RECOVERY_CHAINS.includes(chain.genesisHash) && setStep(STEPS.UNSUPPORTED);
  }, [chain?.genesisHash]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  const fetchRecoveryInformation = useCallback(() => {
    if (!api?.query?.recovery || !formatted) {
      return;
    }

    api.query.recovery.recoverable(formatted).then((r) => {
      setRecoveryInfo(r.isSome ? r.unwrap() as unknown as PalletRecoveryRecoveryConfig : null);
      console.log('is recoverable:', r.isSome ? JSON.parse(JSON.stringify(r.unwrap())) : 'nope');
    }).catch(console.error);

    api.query.recovery.proxy(formatted).then((p) => {
      if (p.isEmpty) {
        setActiveProxy(null);

        return;
      }

      setActiveProxy(p.toHuman() as string);
    }).catch(console.error);
  }, [api, formatted]);

  const clearInformation = useCallback(() => {
    setRecoveryInfo(undefined);
    setRecoveryConfig(undefined);
    setLostAccountAddress(undefined);
    setVouchRecoveryInfo(undefined);
    setWithdrawInfo(undefined);
    setMode(undefined);
    setActiveProxy(undefined);
    setTotalDeposit(BN_ZERO);
    setFetching(false);
    setRefresh(false);
    setStep(STEPS.CHECK_SCREEN);
  }, []);

  useEffect(() => {
    if (closeRecovery === 'false' || !api || !formatted) {
      return;
    }

    fetchRecoveryInformation();
    setMode('CloseRecovery');
    setStep(STEPS.REVIEW);
  }, [api, closeRecovery, fetchRecoveryInformation, formatted]);

  useEffect(() => {
    clearInformation();
  }, [address, chain, chain?.genesisHash, clearInformation]);

  useEffect(() => {
    if (!api || !formatted || chain?.genesisHash !== api.genesisHash.toHex()) {
      setStep(STEPS.CHECK_SCREEN);

      return;
    }

    if (closeRecovery === 'true') {
      return;
    }

    if (recoveryInfo !== undefined && activeProxy !== undefined && activeRescue !== undefined && activeLost !== undefined && refresh === false) {
      return;
    }

    if (fetching) {
      return;
    }

    clearInformation();
    setFetching(true);
    fetchRecoveryInformation();
  }, [formatted, api, chain?.genesisHash, clearInformation, refresh, recoveryInfo, activeProxy, activeRescue, activeLost, fetching, fetchRecoveryInformation, closeRecovery]);

  useEffect(() => {
    if (recoveryInfo === undefined || activeProxy === undefined || activeLost === undefined || activeRescue === undefined || step !== STEPS.CHECK_SCREEN) {
      return;
    }

    setFetching(false);
    setRefresh(false);
    setStep(STEPS.INDEX);
  }, [activeProxy, activeRescue, activeLost, recoveryInfo, step]);

  useEffect(() => {
    if (recoveryInfo) {
      setTotalDeposit(recoveryInfo.deposit);
    }
  }, [recoveryInfo]);

  useEffect(() => {
    api && api.derive.session?.progress().then((sessionInfo) => {
      setSessionInfo({
        currentEra: Number(sessionInfo.currentEra),
        eraLength: Number(sessionInfo.eraLength),
        eraProgress: Number(sessionInfo.eraProgress)
      });
    });
  }, [api]);

  const checkLostAccountBalance = useCallback(() => {
    if (api && lostAccountAddress) {
      api.derive.balances.all(lostAccountAddress.address).then((b) => {
        setLostAccountBalance(b.availableBalance);
        setLostAccountReserved(b.reservedBalance);
      }).catch(console.error);
    }
  }, [api, lostAccountAddress]);

  const checkLostAccountSoloStakedBalance = useCallback(() => {
    if (api && lostAccountAddress && sessionInfo) {
      api.derive.staking.account(lostAccountAddress.address).then((s) => {
        setLostAccountSoloStakingBalance(new BN(s.stakingLedger.active.toString()));

        let unlockingValue = BN_ZERO;
        const toBeReleased: { amount: BN, date: number }[] = [];

        if (s?.unlocking) {
          for (const [_, { remainingEras, value }] of Object.entries(s.unlocking)) {
            if (remainingEras.gtn(0)) {
              const amount = new BN(value as unknown as string);

              unlockingValue = unlockingValue.add(amount);

              const secToBeReleased = (Number(remainingEras) * sessionInfo.eraLength + (sessionInfo.eraLength - sessionInfo.eraProgress)) * 6;

              toBeReleased.push({ amount, date: Date.now() + (secToBeReleased * 1000) });
            }
          }
        }

        setLostAccountSoloUnlock({ amount: unlockingValue, date: toBeReleased.at(-1)?.date ?? 0 });
        setLostAccountRedeemable(s.redeemable);
      }).catch(console.error);
    }
  }, [api, lostAccountAddress, sessionInfo]);

  const checkLostAccountClaimedStatus = useCallback(() => {
    if (api && lostAccountAddress) {
      api.query.recovery.proxy(formatted).then((p) => {
        if (p.isEmpty) {
          setAlreadyClaimed(false);

          return;
        }

        const proxies: string = p.toHuman() as string;

        setAlreadyClaimed(proxies === lostAccountAddress.address);
      }).catch(console.error);
    }
  }, [api, formatted, lostAccountAddress]);

  const checkLostAccountIdentity = useCallback(() => {
    if (accountsInfo && lostAccountAddress) {
      const hasId = !!accountsInfo.find((accountInfo) => accountInfo.accountId?.toString() === lostAccountAddress.address);

      setLostAccountIdentity(hasId);
    }
  }, [accountsInfo, lostAccountAddress]);

  const checkLostAccountPoolStakedBalance = useCallback(() => {
    if (api && lostAccountAddress) {
      api.query.nominationPools.poolMembers(lostAccountAddress.address).then(async (res) => {
        const member = res?.unwrapOr(undefined) as PalletNominationPoolsPoolMember | undefined;

        if (!member) {
          setLostAccountPoolStakingBalance(BN_ZERO);

          return;
        }

        const poolId = member.poolId;
        const accounts = poolId && getPoolAccounts(api, poolId);

        if (!accounts) {
          setLostAccountPoolStakingBalance(BN_ZERO);

          return;
        }

        const [bondedPool, stashIdAccount, myClaimable] = await Promise.all([
          api.query.nominationPools.bondedPools(poolId),
          api.derive.staking.account(accounts.stashId),
          api.call.nominationPoolsApi.pendingRewards(formatted)
        ]);

        const active = member.points.isZero()
          ? BN_ZERO
          : (new BN(String(member.points)).mul(new BN(String(stashIdAccount.stakingLedger.active)))).div(new BN(String(bondedPool.unwrap()?.points ?? BN_ONE)));
        const rewards = myClaimable as Balance;
        let unlockingValue = BN_ZERO;

        member?.unbondingEras?.forEach((value) => {
          unlockingValue = unlockingValue.add(value);
        });

        setLostAccountPoolStakingBalance(active.add(rewards).add(unlockingValue));
      }).catch(console.error);
    }
  }, [api, formatted, lostAccountAddress]);

  useEffect(() => {
    if (fetchingLostAccountInfos || !api || !formatted || (!lostAccountRecoveryInfo && !activeProxy) || withdrawInfo || !lostAccountAddress?.address || !accountsInfo || !sessionInfo || mode !== 'Withdraw') {
      return;
    }

    setFetchingLostAccountInfos(true);
    checkLostAccountBalance();
    checkLostAccountSoloStakedBalance();
    checkLostAccountClaimedStatus();
    checkLostAccountPoolStakedBalance();
    checkLostAccountIdentity();
  }, [activeProxy, sessionInfo, lostAccountRecoveryInfo, api, checkLostAccountBalance, checkLostAccountIdentity, checkLostAccountPoolStakedBalance, accountsInfo, checkLostAccountClaimedStatus, checkLostAccountSoloStakedBalance, fetchingLostAccountInfos, formatted, mode, setWithdrawInfo, withdrawInfo, lostAccountAddress?.address]);

  useEffect(() => {
    if (!lostAccountAddress?.address || !formatted || lostAccountPoolStakingBalance === undefined || lostAccountSoloUnlock === undefined || lostAccountIdentity === undefined || lostAccountBalance === undefined || lostAccountReserved === undefined || lostAccountRedeemable === undefined || lostAccountSoloStakingBalance === undefined || alreadyClaimed === undefined || mode !== 'Withdraw') {
      return;
    }

    setFetchingLostAccountInfos(false);

    setWithdrawInfo({
      availableBalance: lostAccountBalance,
      claimed: alreadyClaimed,
      hasId: lostAccountIdentity,
      isRecoverable: !!lostAccountRecoveryInfo,
      lost: lostAccountAddress.address,
      poolStaked: lostAccountPoolStakingBalance,
      redeemable: lostAccountRedeemable,
      rescuer: String(formatted),
      reserved: lostAccountReserved,
      soloStaked: lostAccountSoloStakingBalance,
      soloUnlock: lostAccountSoloUnlock
    });
  }, [alreadyClaimed, mode, formatted, lostAccountAddress?.address, lostAccountSoloUnlock, lostAccountIdentity, lostAccountPoolStakingBalance, lostAccountReserved, lostAccountBalance, lostAccountRecoveryInfo, lostAccountRedeemable, lostAccountSoloStakingBalance, setWithdrawInfo]);

  return (
    <Grid bgcolor={indexBgColor} container item justifyContent='center'>
      <FullScreenHeader page='socialRecovery' />
      <Grid container item justifyContent='center' sx={{ bgcolor: contentBgColor, height: 'calc(100vh - 70px)', maxWidth: '840px', overflow: 'scroll' }}>
        {step === STEPS.UNSUPPORTED &&
          <Grid alignItems='center' container direction='column' display='block' item>
            <Typography fontSize='30px' fontWeight={700} p='30px 0 60px 80px'>
              {t<string>('Social Recovery')}
            </Typography>
            <Grid container item sx={{ '> div.belowInput': { m: 0 }, height: '30px', m: 'auto', width: '400px' }}>
              <Warning
                fontWeight={500}
                isBelowInput
                theme={theme}
              >
                {t<string>('The chosen blockchain does not support social recovery.')}
              </Warning>
            </Grid>
          </Grid>
        }
        {step === STEPS.CHECK_SCREEN &&
          <RecoveryCheckProgress />
        }
        {step === STEPS.INDEX &&
          <Home
            accountsInfo={accountsInfo}
            activeLost={activeLost}
            activeProxy={activeProxy}
            activeRescue={activeRescue}
            buttonColors={buttonColors}
            chain={chain}
            recoveryInfo={recoveryInfo}
            setLostAccountAddress={setLostAccountAddress}
            setMode={setMode}
            setStep={setStep}
          />
        }
        {step === STEPS.RECOVERY_DETAIL && recoveryInfo &&
          <RecoveryDetail
            api={api}
            chain={chain}
            recoveryInformation={recoveryInfo}
            setMode={setMode}
            setRecoveryConfig={setRecoveryConfig}
            setStep={setStep}
          />
        }
        {step === STEPS.MAKE_RECOVERABLE &&
          <RecoveryConfig
            address={address}
            api={api}
            mode={mode}
            recoveryConfig={recoveryConfig}
            setMode={setMode}
            setRecoveryConfig={setRecoveryConfig}
            setStep={setStep}
            setTotalDeposit={setTotalDeposit}
          />
        }
        {step === STEPS.INITIATE_RECOVERY &&
          <InitiateRecovery
            accountsInfo={accountsInfo}
            activeProxy={activeProxy}
            address={address}
            api={api}
            formatted={String(formatted)}
            initiatedRecovery={activeRescue}
            lostAccountRecoveryInfo={lostAccountRecoveryInfo}
            mode={mode}
            setLostAccountAddress={setLostAccountAddress}
            setLostAccountRecoveryInfo={setLostAccountRecoveryInfo}
            setMode={setMode}
            setStep={setStep}
            setTotalDeposit={setTotalDeposit}
            setWithdrawInfo={setWithdrawInfo}
            withdrawInfo={withdrawInfo}
          />
        }
        {step === STEPS.VOUCH &&
          <Vouch
            activeRecoveries={activeRecoveries}
            address={address}
            api={api}
            setMode={setMode}
            setStep={setStep}
            setVouchRecoveryInfo={setVouchRecoveryInfo}
          />
        }
        {(step === STEPS.REVIEW || step === STEPS.WAIT_SCREEN || step === STEPS.CONFIRM || step === STEPS.PROXY) && chain && recoveryInfo !== undefined &&
          <Review
            activeLost={activeLost}
            address={address}
            allActiveRecoveries={activeRecoveries}
            api={api}
            chain={chain}
            depositValue={totalDeposit}
            lostAccountAddress={lostAccountAddress}
            mode={mode}
            recoveryConfig={recoveryConfig}
            recoveryInfo={recoveryInfo}
            setMode={setMode}
            setRefresh={setRefresh}
            setStep={setStep}
            specific={closeRecovery === 'true'}
            step={step}
            vouchRecoveryInfo={vouchRecoveryInfo}
            withdrawInfo={withdrawInfo}
          />
        }
      </Grid>
    </Grid>
  );
}
