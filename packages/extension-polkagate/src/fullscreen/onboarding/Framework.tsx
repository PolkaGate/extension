// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, Link, Stack, Typography } from '@mui/material';
import React from 'react';

import { backgroundBlur } from '../../assets/img';
import { logoTransparent, polkagateVector } from '../../assets/logos';
import { TwoToneText } from '../../components';
import { useManifest, useTranslation } from '../../hooks';
import Socials from '../../popup/settings/partials/Socials';
import { PRIVACY_POLICY_LINK } from '../../util/constants';
import Bread from './Bread';
import NeedHelp from './NeedHelp';
import TopRightIcons from './TopRightIcons';

interface Props {
  children?: React.ReactNode;
  width?: string;
}

function Framework ({ children, width = '582px' }: Props): React.ReactElement {
  const { t } = useTranslation();
  const version = useManifest()?.version;

  return (
    <Container maxWidth={false} sx={{ alignItems: 'center', display: 'flex', height: '100vh', justifyContent: 'center' }}>
      <Grid alignItems='flex-start' container sx={{ bgcolor: '#05091C', borderRadius: '24px', height: '788px', p: '12px', position: 'relative', width: '1440px' }}>
        <Stack alignItems='center' direction='row' sx={{ borderRadius: '32px', left: '0', p: '15px', position: 'absolute', top: '0', zIndex: 10 }}>
          <Box
            component='img'
            src={(logoTransparent) as string}
            sx={{ width: '38px' }}
          />
          <Box
            component='img'
            src={(polkagateVector) as string}
            sx={{ width: '84px' }}
          />
        </Stack>
        <Grid
          alignItems='flex-start' container sx={{
            backgroundImage: `url(${backgroundBlur})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            bgcolor: '#000000',
            borderRadius: '24px',
            height: '764px',
            p: '7px',
            position: 'relative',
            width: '1416px'
          }}
        >
          <Box sx={{ background: 'linear-gradient(262.56deg, rgba(236, 180, 255, 0) 22.53%, #ECB4FF 47.68%, #ECB4FF 62.78%, rgba(236, 180, 255, 0) 72.53%)', height: '2px', left: `${(1416 - 375) / 2}px`, position: 'absolute', top: 0, width: '375px' }} />
          <TopRightIcons />
          <Bread />
          <Grid container item sx={{ background: 'linear-gradient(90deg, rgba(197, 151, 255, 0.0125) 0%, rgba(91, 31, 166, 0.15) 50.06%, rgba(197, 151, 255, 0.05) 100%)', borderRadius: '24px', height: '693px', m: '5px', position: 'relative', width: '582px' }}>
            <Grid item sx={{ bottom: '100px', ml: '10%', position: 'absolute', width: '50%' }}>
              <Typography color='#FFFFFF' display='block' lineHeight='100%' textAlign='left' textTransform='uppercase' variant='H-1'>
                <TwoToneText
                  text={t('We appreciate your choice in selecting PolkaGate!')}
                  textPartInColor={t('PolkaGate!')}
                />
              </Typography>
              <Typography color='#BEAAD8' display='block' fontSize='14px' pt='15px' variant='B-1'>
                {t('as your gateway to the Polkadot ecosystem! ')}
              </Typography>
            </Grid>
          </Grid>
          <Grid container item sx={{ borderRadius: '24px', height: '693px', m: '40px 0 0 100px', position: 'relative', width }}>
            {children}
          </Grid>
          <Grid alignItems='center' container item justifyContent='space-between' sx={{ bottom: '20px', position: 'absolute', right: '7px', width: '50%' }}>
            <Socials buttonSize={24} iconSize={13.5} style={{ width: 'fit-content', pr: '50px' }} />
            <Grid columnGap='40px' container item width='fit-content'>
              <NeedHelp />
              <Link color='#674394' href={PRIVACY_POLICY_LINK} rel='noreferrer' sx={{ cursor: 'pointer' }} target='_blank' variant='B-5'>
                {t('Privacy & Security')}
              </Link>
              <Typography color='#674394' variant='B-5'>
                {`v.${version}`}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default React.memo(Framework);
