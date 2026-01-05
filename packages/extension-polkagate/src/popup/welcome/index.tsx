// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
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
import StakingActionButton from '../staking/partial/StakingActionButton';
import BlueGradient from '../staking/stakingStyles/BlueGradient';
import AddAccount from './AddAccount';

export enum Popups {
  NONE,
  ADD_ACCOUNT
}

function Welcome(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [popup, setPopup] = useState<Popups>(Popups.NONE);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isBlueish = currentIndex > 1;

  const toggleDisplayElement = useCallback((show: boolean) => ({ opacity: show ? 1 : 0, transition: 'all 600ms ease-out' }), []);

  const onCreateAccount = useCallback((): void => {
    windowOpen('/account/create').catch(console.error);
  }, []);

  const onAddAccount = useCallback((): void => {
    setPopup(Popups.ADD_ACCOUNT);
  }, []);

  return (
    <>
      <Container disableGutters sx={{ position: 'relative' }}>
        <WelcomeHeader isBlueish={isBlueish} />
        <Carousel currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
        <BlueGradient style={toggleDisplayElement(isBlueish)} />
        <GradientBox isBlueish={isBlueish} noGradient={isBlueish} style={{ m: 'auto', width: '359px' }}>
          <BlueGradient style={{ top: '-100px', ...toggleDisplayElement(isBlueish) }} />
          <Grid container item justifyContent='center' sx={{ p: '13px 32px' }}>
            <Box
              component='img'
              src={handWave as string}
              sx={{ height: '48px', width: '48px' }}
            />
            <Typography pb='3px' sx={{ whiteSpace: 'nowrap' }} textTransform='uppercase' variant='H-2' width='100%'>
              {t('Welcome')}<span style={{ color: '#BEAAD8' }}>!</span>
            </Typography>
            <Typography color={isBlueish ? 'text.highlight' : 'text.secondary'} pb='16px' variant='B-1'>
              {t('Currently, you do not have any accounts. Begin by creating your first account or importing existing accounts to get started.')}
            </Typography>
            <GradientButton
              StartIcon={AddCircle}
              contentPlacement='start'
              onClick={onCreateAccount}
              style={{
                borderRadius: '18px',
                height: '48px',
                width: '299px',
                ...toggleDisplayElement(!isBlueish)
              }}
              text={t('Create a new account')}
            />
            <StakingActionButton
              onClick={onCreateAccount}
              startIcon={<AddCircle color={theme.palette.text.primary} size={20} variant='Bulk' />}
              style={{
                '& .MuiButton-startIcon': { mr: '12px' },
                borderRadius: '18px',
                bottom: '86px',
                height: '48px',
                justifyContent: 'flex-start',
                left: '32px',
                pl: '28px',
                position: 'absolute',
                width: '290px',
                ...toggleDisplayElement(isBlueish)
              }}
              text={t('Create a new account')}
            />
            <GradientDivider style={{ my: '14px' }} />
            <ActionButton
              StartIcon={Wallet}
              isBlueish={isBlueish}
              onClick={onAddAccount}
              style={{
                borderRadius: '18px',
                height: '44px',
                width: '295px'
              }}
              text={{
                text: t('Already have an account'),
                textPartInColor: t('have an account')
              }}
              variant='contained'
            />
          </Grid>
        </GradientBox>
        <Version isBlueish={isBlueish} />
      </Container>
      <AddAccount
        openMenu={popup === Popups.ADD_ACCOUNT}
        setPopup={setPopup}
      />
    </>
  );
}

export default (Welcome);
