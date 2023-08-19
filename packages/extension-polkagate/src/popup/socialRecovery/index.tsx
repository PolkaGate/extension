// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';

import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { CubeGrid } from 'better-react-spinkit';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { checkRecovery, rescueRecovery, socialRecoveryDark, socialRecoveryLight, vouchRecovery } from '../../assets/icons';
import { Warning } from '../../components';
import { useApi, useChain, useChainName, useFormatted, useFullscreen, useTranslation } from '../../hooks';
import { FullScreenHeader } from '../governance/FullScreenHeader';

export const STEPS = {
  CHECK_SCREEN: 0,
  INDEX: 1,
  PREVIEW: 2,
  MODIFY: 3,
  REMOVE: 4,
  MANAGESUBID: 5,
  JUDGEMENT: 6,
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

export default function SocialRecovery(): React.ReactElement {
  useFullscreen();

  const { address } = useParams<{ address: string }>();
  const api = useApi(address);
  const { t } = useTranslation();
  const theme = useTheme();
  const chain = useChain(address);
  const chainName = useChainName(address);
  const formatted = useFormatted(address);

  const indexBgColor = useMemo(() => theme.palette.mode === 'light' ? '#DFDFDF' : theme.palette.background.paper, [theme.palette.background.paper, theme.palette.mode]);
  const contentBgColor = useMemo(() => theme.palette.mode === 'light' ? '#F1F1F1' : theme.palette.background.default, [theme.palette.background.default, theme.palette.mode]);

  const [step, setStep] = useState<number>(0);
  const [recoveryInfo, setRecoveryInfo] = useState<PalletRecoveryRecoveryConfig | null | undefined>();

  useEffect(() => {
    if (!api || !address) {
      return;
    }

    setStep(STEPS.CHECK_SCREEN);
    setRecoveryInfo(undefined);

    api.query.recovery.recoverable(address).then((r) => {
      setRecoveryInfo(r.isSome ? r.unwrap() as unknown as PalletRecoveryRecoveryConfig : null);
      console.log('is recoverable:', r.isSome ? JSON.parse(JSON.stringify(r.unwrap())) : 'nope');
      setStep(STEPS.INDEX);
    }).catch(console.error);
  }, [address, api, chain?.genesisHash]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
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
    <Grid alignItems='center' container item justifyContent='space-between' onClick={onClickFunction} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '7px', cursor: 'pointer', p: '25px' }}>
      <Grid alignItems='center' container item width='75px'>
        {icon}
      </Grid>
      <Grid alignItems='flex-start' container direction='column' gap='10px' item xs={9}>
        <Typography color='primary.main' fontSize='18px' fontWeight={500}>
          {t<string>(title)}
        </Typography>
        <Typography fontSize='12px' fontWeight={400}>
          {t<string>(description)}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item width='50px'>
        <ArrowForwardIosIcon
          sx={{ color: 'primary.main', fontSize: '40px', m: 'auto', stroke: '#99004F', strokeWidth: '2px' }}
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
              {t<string>('Manage  Identity')}
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
                      {t<string>('Your account is recoverable.')}
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
            <Typography fontSize='12px' fontWeight={400} py='25px'>
              {t<string>('Social recovery is emerging as a user-friendly solution to keep crypto users\' holdings safe should they lose their precious seed phrase. Social recovery means relying on friends and family to access your crypto.')}
            </Typography>
            <Grid container direction='column' gap='25px' item>
              <RecoveryOptionButton
                description={t<string>('Social recovery is emerging as a user-friendly solution to keep crypto users\' holdings safe should they lose their precious seed phrase.')}
                icon={
                  <Box
                    component='img'
                    src={checkRecovery as string}
                    sx={{ height: '60px', width: '66px' }}
                  />
                }
                onClickFunction={() => null}
                title={recoveryInfo
                  ? t<string>('Make Account Recoverable')
                  : t<string>('Check Recoverability Details')}
              />
              <RecoveryOptionButton
                description={t<string>('Social recovery is emerging as a user-friendly solution to keep crypto users\' holdings safe should they lose their precious seed phrase.')}
                icon={
                  <Box
                    component='img'
                    src={rescueRecovery as string}
                    sx={{ height: '60px', width: '66px' }}
                  />
                }
                onClickFunction={() => null}
                title={t<string>('Rescue Lost Account')}
              />
              <RecoveryOptionButton
                description={t<string>('Social recovery is emerging as a user-friendly solution to keep crypto users\' holdings safe should they lose their precious seed phrase.')}
                icon={
                  <Box
                    component='img'
                    src={vouchRecovery as string}
                    sx={{ height: '60px', width: '66px' }}
                  />
                }
                onClickFunction={() => null}
                title={t<string>('Vouch Recovery For Friend')}
              />
            </Grid>
          </Grid>
        }
      </Grid>
    </Grid>
  );
}
