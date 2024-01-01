// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import type { PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import { BN, BN_ZERO } from '@polkadot/util';

import { PButton, RescueRecoveryIcon, SocialRecoveryIcon, TwoButtons } from '../../components';
import { useChain, useCurrentBlockNumber, useDecimal, useFormatted, useToken, useTranslation } from '../../hooks';
import { ActiveRecoveryFor } from '../../hooks/useActiveRecoveries';
import SelectTrustedFriend, { AddressWithIdentity } from './components/SelectTrustedFriend';
import ActiveProxyStatus from './partial/ActiveProxyStatus';
import InitiatedRecoveryStatus from './partial/InitiatedRecoveryStatus';
import LostAccountRecoveryInfo from './partial/LostAccountRecoveryInfo';
import recoveryDelayPeriod from './util/recoveryDelayPeriod';
import { InitiateRecoveryConfig, SocialRecoveryModes, WithdrawInfo } from './util/types';
import { checkLostAccountRecoverability } from './util/utils';
import { STEPS } from '.';

interface Props {
  address: string | undefined;
  formatted: string | undefined;
  api: ApiPromise | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  mode: SocialRecoveryModes;
  setMode: React.Dispatch<React.SetStateAction<SocialRecoveryModes>>;
  setTotalDeposit: React.Dispatch<React.SetStateAction<BN>>;
  setLostAccountAddress: React.Dispatch<React.SetStateAction<InitiateRecoveryConfig | undefined>>;
  initiatedRecovery: ActiveRecoveryFor | null | undefined;
  withdrawInfo: WithdrawInfo;
  activeProxy: string | null | undefined;
  accountsInfo: DeriveAccountInfo[] | undefined;
  lostAccountRecoveryInfo: false | PalletRecoveryRecoveryConfig | null | undefined;
  setLostAccountRecoveryInfo: React.Dispatch<React.SetStateAction<false | PalletRecoveryRecoveryConfig | null | undefined>>;
}

export default function InitiateRecovery({ accountsInfo, activeProxy, address, api, initiatedRecovery, lostAccountRecoveryInfo, mode, setLostAccountAddress, setLostAccountRecoveryInfo, setMode, setStep, setTotalDeposit, withdrawInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const chain = useChain(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const currentBlockNumber = useCurrentBlockNumber(address);
  const formatted = useFormatted(address);

  const [lostAccount, setLostAccount] = useState<AddressWithIdentity>();
  const [goReview, setGoReview] = useState<boolean>(false);

  const recoveryDeposit = useMemo(() => api ? new BN(api.consts.recovery.recoveryDeposit.toString()) : BN_ZERO, [api]);
  const delayEndBlock = useMemo(() => (initiatedRecovery?.createdBlock ?? 0) + (lostAccountRecoveryInfo ? lostAccountRecoveryInfo?.delayPeriod?.toNumber() : 0), [initiatedRecovery?.createdBlock, lostAccountRecoveryInfo]);
  const isDelayPassed = useMemo(() => {
    if (!initiatedRecovery || !lostAccountRecoveryInfo || !currentBlockNumber || delayEndBlock === 0) {
      return undefined;
    }

    if (delayEndBlock < currentBlockNumber) {
      return true;
    } else {
      return false;
    }
  }, [currentBlockNumber, delayEndBlock, initiatedRecovery, lostAccountRecoveryInfo]);
  const isVouchedCompleted = useMemo(() => {
    if (!initiatedRecovery || !lostAccountRecoveryInfo) {
      return undefined;
    }

    const isEnoughVouched = initiatedRecovery.vouchedFriends.length >= lostAccountRecoveryInfo.threshold.toNumber();

    return isEnoughVouched;
  }, [initiatedRecovery, lostAccountRecoveryInfo]);

  const nextBtnDisable = useMemo(() => {
    if (initiatedRecovery) {
      return !(lostAccountRecoveryInfo && isVouchedCompleted) || !(lostAccountRecoveryInfo && isVouchedCompleted && isDelayPassed);
    } else if (activeProxy) {
      return false;
    } else if (!lostAccount?.address) {
      return true;
    } else if (lostAccount.address === formatted) {
      return true;
    } else if (lostAccount.address && lostAccountRecoveryInfo) {
      return false;
    } else if (lostAccount.address && lostAccountRecoveryInfo === false) {
      return false;
    } else {
      return true;
    }
  }, [activeProxy, formatted, initiatedRecovery, isDelayPassed, isVouchedCompleted, lostAccount?.address, lostAccountRecoveryInfo]);

  useEffect(() => {
    if ((initiatedRecovery || activeProxy) && !lostAccount) {
      setLostAccount({ accountIdentity: undefined, address: activeProxy ?? initiatedRecovery?.lost ?? '' });
    }
  }, [activeProxy, initiatedRecovery, lostAccount]);

  useEffect(() => {
    if (api && initiatedRecovery && !activeProxy && lostAccount && lostAccountRecoveryInfo === false) {
      checkLostAccountRecoverability(api, lostAccount.address, setLostAccountRecoveryInfo);
    }
  }, [api, activeProxy, initiatedRecovery, lostAccount, lostAccountRecoveryInfo, setLostAccountRecoveryInfo]);

  useEffect(() => {
    if (!lostAccount && lostAccountRecoveryInfo !== false) {
      setLostAccountRecoveryInfo(false);
    }
  }, [lostAccount, lostAccount?.address, lostAccountRecoveryInfo, setLostAccountRecoveryInfo]);

  useEffect(() => {
    if (withdrawInfo && goReview) {
      setStep(STEPS.REVIEW);
    }
  }, [goReview, setStep, withdrawInfo]);

  const selectLostAccount = useCallback((addr: AddressWithIdentity | undefined) => {
    setLostAccount(addr);
  }, []);

  const goBack = useCallback(() => {
    setStep(STEPS.INDEX);
    setMode(undefined);
  }, [setMode, setStep]);

  const checkLostAccount = useCallback(() => {
    if (api && lostAccount?.address) {
      checkLostAccountRecoverability(api, lostAccount.address, setLostAccountRecoveryInfo);
    }
  }, [api, lostAccount?.address, setLostAccountRecoveryInfo]);

  const rescueLostAccount = useCallback(() => {
    setLostAccountAddress({
      accountIdentity: lostAccount?.accountIdentity,
      address: lostAccount?.address ?? '',
      delayPeriod: lostAccountRecoveryInfo ? recoveryDelayPeriod(lostAccountRecoveryInfo.delayPeriod.toNumber(), 1) : '0',
      friends: {
        addresses: lostAccountRecoveryInfo ? lostAccountRecoveryInfo.friends.map((friend) => String(friend)) : [],
        infos: lostAccountRecoveryInfo ? lostAccountRecoveryInfo.friends.map((friend) => accountsInfo?.find((accInfo) => String(accInfo.accountId) === String(friend))) : []
      },
      threshold: lostAccountRecoveryInfo ? lostAccountRecoveryInfo.threshold.toNumber() : 0
    });
    setTotalDeposit(recoveryDeposit);
    setMode('InitiateRecovery');
    setStep(STEPS.REVIEW);
  }, [accountsInfo, lostAccount?.accountIdentity, lostAccount?.address, lostAccountRecoveryInfo, recoveryDeposit, setLostAccountAddress, setMode, setStep, setTotalDeposit]);

  const goWithdraw = useCallback(() => {
    setTotalDeposit(lostAccountRecoveryInfo ? lostAccountRecoveryInfo.deposit : BN_ZERO);
    setMode('Withdraw');
    setGoReview(true);
  }, [lostAccountRecoveryInfo, setMode, setTotalDeposit]);

  return (
    <Grid container item sx={{ display: 'block', px: '10%' }}>
      {initiatedRecovery || activeProxy
        ? <>
          <Grid alignItems='center' container item pt='20px' width='fit-content'>
            <SocialRecoveryIcon
              color={theme.palette.text.primary}
              height={66}
              width={66}
            />
            <Typography fontSize='30px' fontWeight={700} pl='15px'>
              {t<string>('Social Recovery')}
            </Typography>
          </Grid>
          {initiatedRecovery
            ? <InitiatedRecoveryStatus
              api={api}
              chain={chain}
              delayRemainBlock={Math.max(0, delayEndBlock - (currentBlockNumber ?? 0))}
              goWithdraw={goWithdraw}
              initiatedRecovery={initiatedRecovery}
              isDelayPassed={isDelayPassed}
              isVouchedCompleted={isVouchedCompleted}
              lostAccountRecoveryInfo={lostAccountRecoveryInfo}
            />
            : <ActiveProxyStatus
              api={api}
              withdrawInfo={withdrawInfo}
            />}
        </>
        : <>
          <Grid alignContent='center' alignItems='center' container item>
            <Grid item sx={{ mr: '20px' }}>
              <RescueRecoveryIcon
                color={theme.palette.text.primary}
                height={43}
                width={43}
              />
            </Grid>
            <Grid item>
              <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
                {t<string>('Initiate Recovery')}
              </Typography>
            </Grid>
          </Grid>
          <Typography fontSize='14px' fontWeight={400} width='100%'>
            {t<string>('The account recovery process for a lost account must be initiated by a rescuer through a token deposit.')}
          </Typography>
          <Typography fontSize='22px' fontWeight={700} pt='10px' width='100%'>
            {t<string>('Step 1 of 2: Confirm lost account ')}
          </Typography>
          <SelectTrustedFriend
            accountsInfo={accountsInfo}
            api={api}
            chain={chain}
            disabled={false}
            helperText={t<string>('Find the account you want to rescue by entering their address or any associated identity details, such as their name, email, Twitter, etc.')}
            iconType='none'
            label={t<string>('Lost accounts')}
            onSelectFriend={selectLostAccount}
            placeHolder={t<string>('Enter account ID or address')}
            style={{ py: '15px', width: '100%' }}
          />
          {lostAccountRecoveryInfo !== false &&
            <Grid container item justifyContent='flex-end' pt='15px' sx={{ '> button': { width: '190px' }, '> div': { width: '190px' } }}>
              <PButton
                _isBusy={lostAccountRecoveryInfo === undefined}
                _ml={0}
                _mt='0'
                _onClick={checkLostAccount}
                disabled={!lostAccount || !api}
                text={t<string>('Verify status')}
              />
            </Grid>
          }
          {lostAccountRecoveryInfo !== false &&
            <LostAccountRecoveryInfo
              accountsInfo={accountsInfo}
              decimal={decimal}
              lostAccountRecoveryInfo={lostAccountRecoveryInfo}
              token={token}
            />
          }
        </>
      }
      <Grid container item justifyContent='flex-end' pt='15px'>
        <Grid container item sx={{ '> div': { m: 0, width: '100%' } }} xs={7}>
          <TwoButtons
            disabled={nextBtnDisable}
            isBusy={mode === 'Withdraw' && !withdrawInfo}
            mt={'1px'}
            onPrimaryClick={initiatedRecovery || activeProxy
              ? goWithdraw
              : lostAccountRecoveryInfo === false
                ? checkLostAccount
                : rescueLostAccount}
            onSecondaryClick={goBack}
            primaryBtnText={initiatedRecovery || activeProxy
              ? t<string>('Withdraw')
              : lostAccountRecoveryInfo === false
                ? t<string>('Verify status')
                : t<string>('Proceed')}
            secondaryBtnText={t<string>('Back')}
            variant='text'
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
