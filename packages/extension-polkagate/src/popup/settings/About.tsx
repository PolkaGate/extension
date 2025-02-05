// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { ActionContext, BackWithLabel } from '../../components';
import { useTranslation } from '../../hooks';
import { UserDashboardHeader } from '../../partials';
import HomeMenu from '../../partials/HomeMenu';
import ContactUs from './partials/ContactUs';
import Introduction from './partials/Introduction';
import LegalDocuments from './partials/LegalDocuments';
import RateUsButton from './partials/RateUsButton';
import Resources from './partials/Resources';
import Socials from './partials/Socials';
import { star } from './icons';

function RateUs (): React.ReactElement {
  return (
    <Grid alignItems='center' columnGap='5px' container item justifyContent='space-between' sx={{ border: '4px solid', borderColor: '#1B133C', borderRadius: '14px', mt: '10px', bgcolor: '#05091C', height: '70px', px: '10px' }}>
      <Grid alignItems='center' container item sx={{ width: 'fit-content' }}>
        <Box
          sx={{
            position: 'relative',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: 36,
              height: 36,
              background: 'linear-gradient(180deg, #FFCE4F 0%, #FFA929 100%)',
              borderRadius: '50%',
              filter: 'blur(8px)',
              opacity: 0.4,
              zIndex: 0
            }}
          />
          <Box
            component='img'
            src={star as string}
            sx={{
              width: '17.42px',
              position: 'relative',
              zIndex: 1
            }}
          />
        </Box>
        <Grid alignItems='baseline' columnGap='5px' container item width='fit-content'>
          <Typography color='text.primary' sx={{ fontFamily: 'Inter', fontSize: '19px', fontWeight: 600, letterSpacing: '-1px' }}>
            4.6
          </Typography>
          <Typography color='#AA83DC' variant='B-4'>
            (26 reviewers)
          </Typography>
        </Grid>
      </Grid>
      <RateUsButton />
    </Grid>
  );
}

function About (): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const onBack = useCallback(() =>
    onAction('/settings')
  , [onAction]);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <BackWithLabel
        onClick={onBack}
        text={t('About PolkaGate')}
      />
      <Grid container item sx={{ px: '10px' }}>
        <Introduction />
        <RateUs />
        <Grid alignItems='flex-start' py='5px' container item justifyContent='flex-start' sx={{ border: '4px solid', borderColor: '#1B133C', borderRadius: '14px', mt: '10px', bgcolor: '#05091C', height: '262px', px: '10px' }}>
          <Socials short />
          <Stack columnGap='35px' direction='row' justifyItems='start'>
            <Resources />
            <ContactUs />
          </Stack>
          <LegalDocuments />
        </Grid>
      </Grid>
      <HomeMenu />
    </Container>
  );
}

export default React.memo(About);
