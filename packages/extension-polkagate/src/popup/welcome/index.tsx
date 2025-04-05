// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { AddCircle, Wallet } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { handWave } from '../../assets/gif';
import { ActionButton, Carousel, GradientBox, GradientButton } from '../../components';
import { useTranslation } from '../../hooks';
import { windowOpen } from '../../messaging';
import { Version, WelcomeHeader } from '../../partials';
import { GradientDivider } from '../../style';
import AddAccount from './AddAccount';

export enum Popups {
  NONE,
  ADD_ACCOUNT
}

function Welcome(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

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
        <Carousel />
        <GradientBox style={{ m: 'auto', width: '359px' }}>
          <Grid container item justifyContent='center' sx={{ p: '18px 32px' }}>
            <Box
              component='img'
              src={handWave as string}
              sx={{ height: '48px', width: '48px' }}
            />
            <Typography pb='3px' textTransform='uppercase' variant='H-2' width='100%'>
              {t('Welcome')}!
            </Typography>
            <Typography color={theme.palette.text.secondary} pb='16px' variant='B-1'>
              {t('Currently, you do not have any accounts. Begin by creating your first account or importing existing accounts to get started.')}
            </Typography>
            <GradientButton
              StartIcon={AddCircle}
              contentPlacement='start'
              onClick={onCreateAccount}
              style={{
                borderRadius: '18px',
                height: '48px',
                width: '299px'
              }}
              text={t('Create a new account')}
            />
            <GradientDivider style={{ my: '14px' }} />
            <ActionButton
              StartIcon={Wallet}
              onClick={onAddAccount}
              style={{
                borderRadius: '18px',
                height: '44px',
                width: '295px'
              }}
              text={{
                firstPart: t('Already'),
                secondPart: t('have an account')
              }}
              variant='contained'
            />
          </Grid>
        </GradientBox>
        <Version />
      </Container>
      <AddAccount
        openMenu={popup === Popups.ADD_ACCOUNT}
        setPopup={setPopup}
      />
    </>
  );
}

export default (Welcome);
