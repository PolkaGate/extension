// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';
import type { PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';

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
import { FullScreenHeader } from '../governance/FullScreenHeader';
import { AddressWithIdentity } from './components/SelectTrustedFriend';
import RecoveryCheckProgress from './partial/RecoveryCheckProgress';
import { InitiateRecoveryConfig, RecoveryConfigType, SessionInfo, SocialRecoveryModes, WithdrawInfo } from './util/types';
import { checkLostAccountBalance, checkLostAccountClaimedStatus, checkLostAccountIdentity, checkLostAccountPoolStakedBalance, checkLostAccountProxy, checkLostAccountSoloStakedBalance } from './util/utils';
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
  const [vouchRecoveryInfo, setVouchRecoveryInfo] = useState<{ lost: AddressWithIdentity, rescuer: AddressWithIdentity } | undefined>();
  const [withdrawInfo, setWithdrawInfo] = useState<WithdrawInfo | undefined>();
  const [mode, setMode] = useState<SocialRecoveryModes>();
  const [totalDeposit, setTotalDeposit] = useState<BN>(BN_ZERO);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(false);
  const [activeProxy, setActiveProxy] = useState<string | null>();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>();
  const [lostAccountBalance, setLostAccountBalance] = useState<Balance | undefined>();
  const [lostAccountRedeemable, setLostAccountRedeemable] = useState<Balance | undefined>();
  const [lostAccountPoolRedeemable, setLostAccountPoolRedeemable] = useState<{ amount: BN, count: number } | undefined>();
  const [lostAccountSoloStakingBalance, setLostAccountSoloStakingBalance] = useState<BN | undefined>();
  const [lostAccountPoolStakingBalance, setLostAccountPoolStakingBalance] = useState<{ amount: BN, hasRule: boolean } | undefined>();
  const [lostAccountReserved, setLostAccountReserved] = useState<BN | undefined>();
  const [lostAccountSoloUnlock, setLostAccountSoloUnlock] = useState<{ amount: BN, date: number } | undefined>();
  const [lostAccountPoolUnlock, setLostAccountPoolUnlock] = useState<{ amount: BN, date: number } | undefined>();
  const [lostAccountIdentity, setLostAccountIdentity] = useState<boolean | undefined>();
  const [lostAccountProxy, setLostAccountProxy] = useState<boolean | undefined>();
  const [alreadyClaimed, setAlreadyClaimed] = useState<boolean | undefined>();
  const [lostAccountRecoveryInfo, setLostAccountRecoveryInfo] = useState<PalletRecoveryRecoveryConfig | null | undefined | false>(false);
  const [fetchingLostAccountInfos, setFetchingLostAccountInfos] = useState<boolean>(false);

  const activeRecoveries = useActiveRecoveries(refresh ? undefined : api);
  const unsupportedChain = useMemo(() => !!(chain?.genesisHash && !(SOCIAL_RECOVERY_CHAINS.includes(chain.genesisHash))), [chain?.genesisHash]);

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

  useEffect(() => {
    unsupportedChain ? setStep(STEPS.UNSUPPORTED) : setStep(STEPS.CHECK_SCREEN);
  }, [unsupportedChain]);

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

  const clearLostAccountInformation = useCallback(() => {
    setLostAccountBalance(undefined);
    setLostAccountRedeemable(undefined);
    setLostAccountPoolRedeemable(undefined);
    setLostAccountSoloStakingBalance(undefined);
    setLostAccountPoolStakingBalance(undefined);
    setLostAccountReserved(undefined);
    setLostAccountSoloUnlock(undefined);
    setLostAccountPoolUnlock(undefined);
    setLostAccountIdentity(undefined);
    setLostAccountProxy(undefined);
    setAlreadyClaimed(undefined);
  }, []);

  useEffect(() => {
    if (closeRecovery === 'false' || !api || !formatted || unsupportedChain) {
      return;
    }

    fetchRecoveryInformation();
    setMode('CloseRecovery');
    setStep(STEPS.REVIEW);
  }, [api, closeRecovery, fetchRecoveryInformation, formatted, unsupportedChain]);

  useEffect(() => {
    if (unsupportedChain) {
      return;
    }

    clearInformation();
    clearLostAccountInformation();
  }, [address, chain, chain?.genesisHash, clearInformation, clearLostAccountInformation, unsupportedChain]);

  useEffect(() => {
    if (unsupportedChain) {
      return;
    }

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
    clearLostAccountInformation();
    setFetching(true);
    fetchRecoveryInformation();
  }, [formatted, api, chain?.genesisHash, clearInformation, clearLostAccountInformation, refresh, recoveryInfo, activeProxy, activeRescue, activeLost, fetching, fetchRecoveryInformation, closeRecovery, unsupportedChain]);

  useEffect(() => {
    if (recoveryInfo === undefined || activeProxy === undefined || activeLost === undefined || activeRescue === undefined || step !== STEPS.CHECK_SCREEN || unsupportedChain) {
      return;
    }

    setFetching(false);
    setRefresh(false);
    setStep(STEPS.INDEX);
  }, [activeProxy, activeRescue, activeLost, recoveryInfo, step, unsupportedChain]);

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

  useEffect(() => {
    if (fetchingLostAccountInfos || !api || !formatted || (!lostAccountRecoveryInfo && !activeProxy) || withdrawInfo || !lostAccountAddress?.address || !accountsInfo || !sessionInfo || mode !== 'Withdraw') {
      return;
    }

    setFetchingLostAccountInfos(true);
    checkLostAccountBalance(api, lostAccountAddress.address, setLostAccountBalance, setLostAccountReserved);
    checkLostAccountSoloStakedBalance(api, lostAccountAddress.address, sessionInfo, setLostAccountSoloStakingBalance, setLostAccountSoloUnlock, setLostAccountRedeemable);
    checkLostAccountClaimedStatus(api, String(formatted), lostAccountAddress.address, setAlreadyClaimed);
    checkLostAccountPoolStakedBalance(api, lostAccountAddress.address, sessionInfo, setLostAccountPoolStakingBalance, setLostAccountPoolUnlock, setLostAccountPoolRedeemable);
    checkLostAccountIdentity(accountsInfo, lostAccountAddress.address, setLostAccountIdentity);
    checkLostAccountProxy(api, lostAccountAddress.address, setLostAccountProxy);
  }, [activeProxy, sessionInfo, lostAccountRecoveryInfo, api, accountsInfo, fetchingLostAccountInfos, formatted, mode, setWithdrawInfo, withdrawInfo, lostAccountAddress?.address]);

  useEffect(() => {
    if (!lostAccountAddress?.address || !formatted || lostAccountPoolUnlock === undefined || lostAccountPoolStakingBalance === undefined || lostAccountSoloUnlock === undefined || lostAccountIdentity === undefined || lostAccountProxy === undefined || lostAccountBalance === undefined || lostAccountReserved === undefined || lostAccountPoolRedeemable === undefined || lostAccountRedeemable === undefined || lostAccountSoloStakingBalance === undefined || alreadyClaimed === undefined || mode !== 'Withdraw') {
      return;
    }

    setFetchingLostAccountInfos(false);

    setWithdrawInfo({
      availableBalance: lostAccountBalance,
      claimed: alreadyClaimed,
      hasId: lostAccountIdentity,
      hasProxy: lostAccountProxy,
      isRecoverable: !!lostAccountRecoveryInfo,
      lost: lostAccountAddress.address,
      poolRedeemable: lostAccountPoolRedeemable,
      poolStaked: lostAccountPoolStakingBalance,
      poolUnlock: lostAccountPoolUnlock,
      redeemable: lostAccountRedeemable,
      rescuer: String(formatted),
      reserved: lostAccountReserved,
      soloStaked: lostAccountSoloStakingBalance,
      soloUnlock: lostAccountSoloUnlock
    });
  }, [alreadyClaimed, mode, formatted, lostAccountPoolRedeemable, lostAccountAddress?.address, lostAccountPoolUnlock, lostAccountSoloUnlock, lostAccountProxy, lostAccountIdentity, lostAccountPoolStakingBalance, lostAccountReserved, lostAccountBalance, lostAccountRecoveryInfo, lostAccountRedeemable, lostAccountSoloStakingBalance, setWithdrawInfo]);

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
