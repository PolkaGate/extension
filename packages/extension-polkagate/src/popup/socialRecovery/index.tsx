// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { DeriveAccountInfo } from '@polkadot/api-derive/types';
import type { PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';

import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { CubeGrid } from 'better-react-spinkit';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ZERO } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { checkRecovery, checkRecoveryDark, rescueRecovery, rescueRecoveryDark, socialRecoveryDark, socialRecoveryLight, vouchRecovery, vouchRecoveryDark } from '../../assets/icons';
import { PButton, Warning } from '../../components';
import { useActiveRecoveries, useApi, useChain, useFormatted, useFullscreen, useTranslation } from '../../hooks';
import { SOCIAL_RECOVERY_CHAINS } from '../../util/constants';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import { FriendWithId } from './components/SelectTrustedFriend';
import InitiateRecovery from './InitiateRecovery';
import RecoveryDetail from './RecoveryDetail';
import Review from './Review';
import RecoveryConfig from './SetRecoverable';
import Vouch from './VouchRecovery';

export const STEPS = {
  CHECK_SCREEN: 0,
  INDEX: 1,
  MAKERECOVERABLE: 2,
  MODIFY: 3,
  RECOVERYDETAIL: 4,
  INITIATERECOVERY: 5,
  VOUCH: 6,
  REVIEW: 7,
  WAIT_SCREEN: 8,
  CONFIRM: 9,
  UNSUPPORTED: 10,
  PROXY: 100
};

interface RecoveryOptionButtonType {
  icon: unknown;
  title: string;
  description: string;
  onClickFunction: () => void;
}

export type SocialRecoveryModes = 'RemoveRecovery' | 'SetRecovery' | 'ModifyRecovery' | 'InitiateRecovery' | 'CloseRecovery' | 'VouchRecovery' | 'Withdraw' | undefined;
export type RecoveryConfigType = {
  friends: { addresses: string[], infos?: (DeriveAccountInfo | undefined)[] | undefined };
  threshold: number;
  delayPeriod: number;
} | undefined;
export type WithdrawInfo = {
  rescuer: string;
  lost: string;
  claimed: boolean;
  isRecoverable: boolean;
  availableBalance: BN;
  redeemable: BN;
  soloStaked: BN;
  poolStaked: BN;
  reserved: BN;
  hasId: boolean;
  soloUnlock: { amount: BN, date: number };
} | undefined;
export type InitiateRecoveryConfig = {
  address: string;
  accountIdentity: DeriveAccountInfo | undefined;
  friends?: {
    addresses: string[];
    infos?: (DeriveAccountInfo | undefined)[] | undefined;
  };
  threshold?: number;
  delayPeriod?: string;
}

export default function SocialRecovery(): React.ReactElement {
  useFullscreen();

  const { address } = useParams<{ address: string }>();
  const api = useApi(address);
  const { t } = useTranslation();
  const theme = useTheme();
  const chain = useChain(address);
  const formatted = useFormatted(address);
  const activeRecoveries = useActiveRecoveries(api, String(formatted));

  const indexBgColor = useMemo(() => theme.palette.mode === 'light' ? '#DFDFDF' : theme.palette.background.paper, [theme.palette.background.paper, theme.palette.mode]);
  const contentBgColor = useMemo(() => theme.palette.mode === 'light' ? '#F1F1F1' : theme.palette.background.default, [theme.palette.background.default, theme.palette.mode]);

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

  useEffect(() => {
    chain?.genesisHash && !SOCIAL_RECOVERY_CHAINS.includes(chain.genesisHash) && setStep(STEPS.UNSUPPORTED);
  }, [chain?.genesisHash]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  const fetchRecoveryInformation = useCallback(() => {
    if (!api || !formatted) {
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
    clearInformation();
  }, [address, chain, chain?.genesisHash, clearInformation]);

  useEffect(() => {
    if (!api || !formatted) {
      setStep(STEPS.CHECK_SCREEN);

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
  }, [formatted, api, chain?.genesisHash, clearInformation, refresh, recoveryInfo, activeProxy, activeRescue, activeLost, fetching, fetchRecoveryInformation]);

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

  const goToRecoveryDetail = useCallback(() => {
    setStep(STEPS.RECOVERYDETAIL);
  }, []);

  const goToMakeRecoverable = useCallback(() => {
    setStep(STEPS.MAKERECOVERABLE);
  }, []);

  const goToInitiateRecovery = useCallback(() => {
    setStep(STEPS.INITIATERECOVERY);
  }, []);

  const goToVouchRecovery = useCallback(() => {
    setStep(STEPS.VOUCH);
  }, []);

  const goCloseRecovery = useCallback(() => {
    setMode('CloseRecovery');
    setStep(STEPS.REVIEW);
  }, []);

  const RecoveryCheckProgress = () => {
    return (
      <Grid alignItems='center' container direction='column' height='100%' item justifyContent='center'>
        <CubeGrid col={3} color={theme.palette.secondary.main} row={3} size={200} style={{ opacity: '0.4' }} />
        <Typography pt='15px'>
          {t<string>('Checking the account recovery status, please wait...')}
        </Typography>
      </Grid>
    );
  };

  const RecoveryOptionButton = ({ description, icon, onClickFunction, title }: RecoveryOptionButtonType) => (
    <Grid alignItems='center' container item justifyContent='space-between' onClick={activeLost ? undefined : onClickFunction} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '7px', cursor: activeLost ? 'default' : 'pointer', height: '125px', p: '25px', position: 'relative' }}>
      {activeLost &&
        <Grid sx={{ bgcolor: 'rgba(116, 116, 116, 0.2)', borderRadius: '5px', height: '123px', position: 'absolute', right: 0, top: 0, width: '670px', zIndex: 10 }}>
        </Grid>
      }
      <Grid alignItems='center' container item width='75px'>
        {icon}
      </Grid>
      <Grid alignItems='flex-start' container direction='column' gap='10px' item xs={9}>
        <Typography color={buttonColors} fontSize='18px' fontWeight={500}>
          {t<string>(title)}
        </Typography>
        <Typography fontSize='12px' fontWeight={400}>
          {t<string>(description)}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item width='50px'>
        <ArrowForwardIosIcon
          sx={{ color: buttonColors, fontSize: '40px', m: 'auto', stroke: buttonColors, strokeWidth: '2px' }}
        />
      </Grid>
    </Grid>
  );

  const RecoveryHomePage = () => (
    <Grid container item sx={{ display: 'block', px: '10%' }}>
      <Grid container item justifyContent='space-between' pb='20px' pt='35px'>
        <Grid alignItems='center' container item width='fit-content'>
          <Box
            component='img'
            src={theme.palette.mode === 'dark'
              ? socialRecoveryDark as string
              : socialRecoveryLight as string}
            sx={{ height: '66px', width: '66px' }}
          />
          <Typography fontSize='30px' fontWeight={700} pl='15px'>
            {t<string>('Social Recovery')}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item width='fit-content'>
          {recoveryInfo
            ? <>
              <FontAwesomeIcon
                color={theme.palette.success.main}
                fontSize='30px'
                icon={faShieldHalved}
              />
              <Typography fontSize='14px' fontWeight={400} pl='8px'>
                {t<string>('Your account is recoverable')}
              </Typography>
            </>
            : <Grid container item sx={{ '> div.belowInput': { m: 0 }, height: '30px', m: 'auto', width: '240px' }}>
              <Warning
                fontWeight={400}
                isBelowInput
                theme={theme}
              >
                {t<string>('Your account is not recoverable.')}
              </Warning>
            </Grid>
          }
        </Grid>
      </Grid>
      <Typography fontSize='12px' fontWeight={400} py={activeLost ? '10px' : '25px'}>
        {t<string>('Social recovery is emerging as a user-friendly solution to keep crypto users\' holdings safe should they lose their precious seed phrase. Social recovery means relying on friends and family to access your crypto.')}
      </Typography>
      {activeLost &&
        <Grid alignItems='center' container item justifyContent='space-between' pb='15px' pt='10px'>
          <Grid container item sx={{ '> div.belowInput': { m: 0 }, height: '30px', width: '330px' }}>
            <Warning
              fontWeight={500}
              isBelowInput
              isDanger
              theme={theme}
            >
              {t<string>('Suspicious recovery detected on your account.')}
            </Warning>
          </Grid>
          <Grid container item justifyContent='flex-end' sx={{ '> button': { width: '280px' }, '> div': { width: '280px' }, width: 'fit-content' }}>
            <PButton
              _ml={0}
              _mt='0'
              _onClick={goCloseRecovery}
              text={t<string>('Close Recovery')}
            />
          </Grid>
        </Grid>
      }
      <Grid container direction='column' gap='25px' item>
        <RecoveryOptionButton
          description={
            recoveryInfo
              ? t<string>('Click to view your selected trusted friend accounts and your account recovery settings.')
              : t<string>('Select trusted friends\' accounts and configure details such as a recovery threshold and a delay to enable account recovery.')
          }
          icon={
            <Box
              component='img'
              src={theme.palette.mode === 'light'
                ? checkRecovery as string
                : checkRecoveryDark as string}
              sx={{ height: '60px', width: '66px' }}
            />
          }
          onClickFunction={recoveryInfo
            ? goToRecoveryDetail
            : goToMakeRecoverable}
          title={recoveryInfo
            ? t<string>('Check Recoverability Details')
            : t<string>('Make Account Recoverable')}
        />
        <RecoveryOptionButton
          description={
            activeRescue || activeProxy
              ? t<string>('Since you\'ve already initiated the recovery process for a lost account, you can now review the recovery process details and decide on any further actions.')
              : t<string>('If you\'ve lost a recoverable account, you can begin the process of rescuing it from here.')
          }
          icon={
            <Box
              component='img'
              src={theme.palette.mode === 'light'
                ? rescueRecovery as string
                : rescueRecoveryDark as string}
              sx={{ height: '60px', width: '66px' }}
            />
          }
          onClickFunction={goToInitiateRecovery}
          title={activeRescue || activeProxy
            ? t<string>('You Initiated a Recovery. Check Status')
            : t<string>('Rescue a Lost Account')}
        />
        <RecoveryOptionButton
          description={t<string>('Social recovery is emerging as a user-friendly solution to keep crypto users\' holdings safe should they lose their precious seed phrase.')}
          icon={
            <Box
              component='img'
              src={theme.palette.mode === 'light'
                ? vouchRecovery as string
                : vouchRecoveryDark as string}
              sx={{ height: '60px', width: '66px' }}
            />
          }
          onClickFunction={goToVouchRecovery}
          title={t<string>('Vouch Recovery for a Friend')}
        />
      </Grid>
    </Grid>
  );

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
          <RecoveryHomePage />
        }
        {step === STEPS.RECOVERYDETAIL && recoveryInfo &&
          <RecoveryDetail
            api={api}
            chain={chain}
            recoveryInformation={recoveryInfo}
            setMode={setMode}
            setRecoveryConfig={setRecoveryConfig}
            setStep={setStep}
          />
        }
        {step === STEPS.MAKERECOVERABLE &&
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
        {step === STEPS.INITIATERECOVERY &&
          <InitiateRecovery
            address={address}
            api={api}
            activeProxy={activeProxy}
            formatted={String(formatted)}
            initiatedRecovery={activeRescue}
            mode={mode}
            setLostAccountAddress={setLostAccountAddress}
            setMode={setMode}
            setStep={setStep}
            setTotalDeposit={setTotalDeposit}
            setWithdrawInfo={setWithdrawInfo}
            withdrawInfo={withdrawInfo}
          />
        }
        {step === STEPS.VOUCH &&
          <Vouch
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
            step={step}
            vouchRecoveryInfo={vouchRecoveryInfo}
            withdrawInfo={withdrawInfo}
          />
        }
      </Grid>
    </Grid>
  );
}
