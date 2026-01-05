// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, Link } from '@mui/material';
import React from 'react';

import { Version } from '@polkadot/extension-polkagate/src/partials';

import { onboardingBackground } from '../../assets/img';
import { CarouselFs } from '../../components';
import { useFullscreen, useTranslation } from '../../hooks';
import Socials from '../../popup/settings/partials/Socials';
import { PRIVACY_POLICY_LINK } from '../../util/constants';
import LogoWithText from '../components/layout/LogoWithText';
import Bread from './Bread';
import NeedHelp from './NeedHelp';
import TopRightIcons from './TopRightIcons';

interface Props {
  children?: React.ReactNode;
  showBread?: boolean;
  showLeftColumn?: boolean;
  width?: string;
  childrenStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

const INNER_WIDTH = 1416;

function SocialRow({ showLeftColumn }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Grid alignItems='center' container item justifyContent='space-between' sx={{ bottom: '20px', position: 'absolute', right: showLeftColumn ? '30px' : `calc(${INNER_WIDTH}-50%)px`, width: '50%' }}>
      <Socials buttonSize={24} iconSize={13.5} style={{ pr: '50px', width: 'fit-content' }} />
      <Grid columnGap='40px' container item width='fit-content'>
        <NeedHelp />
        <Link href={PRIVACY_POLICY_LINK} rel='noreferrer' sx={{ '&:hover': { color: '#AA83DC' }, color: '#674394', cursor: 'pointer' }} target='_blank' underline='none' variant='B-5'>
          {t('Privacy & Security')}
        </Link>
        <Version style={{ padding: 0, width: 'fit-content' }} variant='B-5' />
      </Grid>
    </Grid>
  );
}

function OnboardingLayout({ children, childrenStyle = {}, showBread = true, showLeftColumn = true, style }: Props): React.ReactElement {
  useFullscreen();

  return (
    <Container maxWidth={false} sx={{ alignItems: 'center', display: 'flex', height: '100vh', justifyContent: 'center', ...style }}>
      <Grid alignItems='flex-start' container sx={{ bgcolor: '#05091C', borderRadius: '24px', minHeight: '788px', height: '100vh', p: '12px', position: 'relative', width: '1440px' }}>
        <LogoWithText style={{ borderRadius: '32px', left: '0', padding: '15px', position: 'absolute', top: '0', zIndex: 10 }} />
        <Grid
          alignItems='flex-start'
          container
          justifyContent={showLeftColumn ? 'start' : 'center'}
          sx={{
            backgroundImage: `url(${onboardingBackground})`,
            backgroundPosition: 'top',
            backgroundRepeat: 'no-repeat',
            borderRadius: '24px',
            height: '100vh',
            minHeight: '764px',
            p: '7px',
            position: 'relative',
            width: `${INNER_WIDTH}px`
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(262.56deg, rgba(236, 180, 255, 0) 22.53%, #ECB4FF 47.68%, #ECB4FF 62.78%, rgba(236, 180, 255, 0) 72.53%)',
              height: '2px',
              left: `${(INNER_WIDTH - 375) / 2}px`,
              position: 'absolute',
              top: 0,
              width: '375px'
            }}
          />
          <TopRightIcons />
          {
            showBread &&
            <Bread />
          }
          {
            showLeftColumn &&
            <CarouselFs />
          }
          <Grid container item sx={{ borderRadius: '24px', display: 'block', height: '693px', m: '62px 0 0 130px', position: 'relative', width: '582px', ...childrenStyle }}>
            {children}
          </Grid>
          <SocialRow showLeftColumn={showLeftColumn} />
        </Grid>
      </Grid>
    </Container>
  );
}

export default React.memo(OnboardingLayout);
