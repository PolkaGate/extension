// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { AddCircle, Wallet } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { handWave } from '../../assets/gif';
import { ActionButton, Carousel, GradientBox, GradientButton, GradientDivider } from '../../components';
import { useManifest, useTranslation } from '../../hooks';
import { windowOpen } from '../../messaging';
import { LogoDropAnimation, WelcomeHeader } from '../../partials';
import AddAccount from './AddAccount';

export enum Popups {
  NONE,
  ADD_ACCOUNT
}

function Welcome (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const version = useManifest()?.version;

  const [popup, setPopup] = useState<Popups>(Popups.NONE);

  const onCreateAccount = useCallback((): void => {
    windowOpen('/account/create').catch(console.error);
  }, []);

  const onAddAccount = useCallback((): void => {
    setPopup(Popups.ADD_ACCOUNT);
  }, []);

  return (
    <>
      <Container disableGutters sx={{ position: 'relative' }}>
        <WelcomeHeader />
        <LogoDropAnimation
          ground={210}
          style={{
            bottom: '200px',
            left: 0,
            right: 0,
            top: 0
          }}
        />
        <Carousel />
        <GradientBox style={{ m: 'auto', width: '359px' }}>
          <Grid container item justifyContent='center' sx={{ p: '18px 32px' }}>
            <Box
              component='img'
              src={handWave as string}
              sx={{ height: '48px', width: '48px' }}
            />
            <Typography fontFamily='OdibeeSans' fontSize='29px' fontWeight={400} pb='3px' textAlign='center' textTransform='uppercase' width='100%'>
              {t('Welcome')}!
            </Typography>
            <Typography color={theme.palette.text.secondary} fontFamily='Inter' fontSize='13px' fontWeight={500} lineHeight='18.2px' pb='16px' textAlign='center'>
              {t('Currently, you do not have any accounts. Begin by creating your first account or importing existing accounts to get started.')}
            </Typography>
            <GradientButton
              contentPlacement='start'
              onClick={onCreateAccount}
              startIcon={<AddCircle color={theme.palette.text.primary} size='20' variant='Bulk' />}
              style={{
                borderRadius: '18px',
                height: '46px',
                width: '294px'
              }}
              text={t('Create a new account')}
              variant='contained'
            />
            <GradientDivider style={{ my: '14px' }} />
            <ActionButton
              StartIcon={Wallet}
              onClick={onAddAccount}
              style={{
                borderRadius: '18px',
                height: '46px',
                width: '294px'
              }}
              text={{
                firstPart: t('Already'),
                secondPart: t('have an account')
              }}
              variant='contained'
            />
          </Grid>
        </GradientBox>
        <Typography color='#674394' fontFamily='Inter' fontSize='13px' fontWeight={500} lineHeight='18.2px' pt='8px' textAlign='center'>
          {'v.'}{version}
        </Typography>
      </Container>
      <AddAccount
        openMenu={popup === Popups.ADD_ACCOUNT}
        setPopup={setPopup}
      />
    </>
  );
}

export default (Welcome);
