// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck


import type { PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';
import type { InitiateRecoveryConfig, SocialRecoveryModes } from './util/types';

import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import type { Chain } from '@polkadot/extension-chains/types';


import { MakeRecoverableIcon, PButton, RescueRecoveryIcon, SocialRecoveryIcon, VouchRecoveryIcon, Warning } from '../../components';
import { useTranslation } from '../../hooks';
import { ActiveRecoveryFor } from '../../hooks/useActiveRecoveries';
import { SOCIAL_RECOVERY_CHAINS } from '../../util/constants';
import RecoveryOptionButton from './components/RecoveryOptionButton';
import { STEPS } from '.';

interface Props {
  accountsInfo: DeriveAccountInfo[] | undefined
  activeLost: ActiveRecoveryFor | null | undefined;
  activeRescue: ActiveRecoveryFor | null | undefined;
  activeProxy: string | null | undefined;
  chain: Chain | null | undefined;
  recoveryInfo: PalletRecoveryRecoveryConfig | null | undefined;
  setMode: React.Dispatch<React.SetStateAction<SocialRecoveryModes>>
  setStep: React.Dispatch<React.SetStateAction<number>>
  setLostAccountAddress: React.Dispatch<React.SetStateAction<InitiateRecoveryConfig | undefined>>
}

export default function Home({ accountsInfo, activeLost, activeProxy, activeRescue, chain, recoveryInfo, setLostAccountAddress, setMode, setStep }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDisabled = !!activeLost;
  const iconColors = isDisabled ? theme.palette.secondary.contrastText : theme.palette.secondary.main;

  const goCloseRecovery = useCallback(() => {
    setMode('CloseRecovery');
    setStep(STEPS.REVIEW);
  }, [setMode, setStep]);

  const goToRecoveryDetail = useCallback(() => {
    setStep(STEPS.RECOVERY_DETAIL);
  }, [setStep]);

  const goToMakeRecoverable = useCallback(() => {
    setMode(undefined);
    setStep(STEPS.MAKE_RECOVERABLE);
  }, [setMode, setStep]);

  const setLostAccount = useCallback(() => {
    setLostAccountAddress({
      accountIdentity: accountsInfo?.find((accInfo) => String(accInfo.accountId) === activeProxy ?? activeRescue?.lost),
      address: activeProxy ?? activeRescue?.lost ?? ''
    });
  }, [accountsInfo, activeProxy, activeRescue?.lost, setLostAccountAddress]);

  const goToCheckInitiatedRecovery = useCallback(() => {
    setLostAccount();
    setMode('Withdraw');
    setStep(STEPS.INITIATE_RECOVERY);
  }, [setLostAccount, setMode, setStep]);

  const goToVouchRecovery = useCallback(() => {
    setStep(STEPS.VOUCH);
  }, [setStep]);

  const goToInitiateRecovery = useCallback(() => {
    setStep(STEPS.INITIATE_RECOVERY);
  }, [setStep]);

  const goNextTimeWithdraw = useCallback(() => {
    setLostAccount();
    setMode('Withdraw');
    setStep(STEPS.REVIEW);
  }, [setLostAccount, setMode, setStep]);

  return (
    <Grid container item sx={{ display: 'block' }}>
      <Grid container item justifyContent='space-between' pb='20px' pt='35px'>
        <Grid alignItems='center' container item width='fit-content'>
          <SocialRecoveryIcon
            color={
              !chain || !(SOCIAL_RECOVERY_CHAINS.includes(chain.genesisHash ?? ''))
                ? theme.palette.text.disabled
                : theme.palette.text.primary}
            height={66}
            width={66}
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
      <Typography fontSize='14px' fontWeight={400} py={activeLost ? '10px' : '25px'}>
        {t<string>('Social recovery provides a user-friendly solution for safeguarding crypto assets in case of a lost seed phrase. It involves relying on trusted friends and family to regain access to your account.')}
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
              text={t<string>('End Recovery')}
            />
          </Grid>
        </Grid>
      }
      <Grid container direction='column' gap='25px' item>
        <RecoveryOptionButton
          activeLost={activeLost}
          description={
            recoveryInfo
              ? t<string>('Click to view your selected trusted friend accounts and your account recovery settings.')
              : t<string>('Select trusted friends\' accounts and configure details such as a recovery threshold and a delay to enable account recovery.')
          }
          icon={
            <MakeRecoverableIcon
              color={iconColors}
              height={60}
              width={66}
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
          activeLost={activeLost}
          description={
            activeRescue || activeProxy
              ? t<string>('Since you\'ve already initiated the recovery process for a lost account, you can now review the recovery process details and decide on any further actions.')
              : t<string>('If you\'ve lost a recoverable account, you can begin the process of rescuing it from here.')
          }
          icon={
            <RescueRecoveryIcon
              color={iconColors}
              height={60}
              width={66}
            />
          }
          onClickFunction={activeRescue
            ? goToCheckInitiatedRecovery
            : activeProxy
              ? goNextTimeWithdraw
              : goToInitiateRecovery}
          title={activeRescue || activeProxy
            ? t<string>('You Initiated a Recovery. Check Status')
            : t<string>('Rescue a Lost Account')}
        />
        <RecoveryOptionButton
          activeLost={activeLost}
          description={t<string>('You can assist others in recovering their lost accounts if they\'ve designated your account as a trusted friend during the account recovery setup.')}
          icon={
            <VouchRecoveryIcon
              color={iconColors}
              height={60}
              width={66}
            />
          }
          onClickFunction={goToVouchRecovery}
          title={t<string>('Vouch Recovery for a Friend')}
        />
      </Grid>
    </Grid>
  );
}
