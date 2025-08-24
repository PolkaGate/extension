// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Stack } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { ActionContext, BackWithLabel, Motion } from '../../../components';
import { useTranslation } from '../../../hooks';
import { UserDashboardHeader } from '../../../partials';
import HomeMenu from '../../../partials/HomeMenu';
import Introduction from '../partials/Introduction';
import Socials from '../partials/Socials';
import ContactUs from './ContactUs';
import LegalDocuments from './LegalDocuments';
import RateUs from './RateUs';
import Resources from './Resources';

function About (): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const onBack = useCallback(() => onAction('/settings'), [onAction]);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <Motion variant='slide'>
        <BackWithLabel
          onClick={onBack}
          text={t('About PolkaGate')}
        />
        <Grid container item sx={{ px: '10px' }}>
          <Introduction style={{ border: '4px solid', borderColor: 'border.paper', height: '54px' }} />
          <RateUs />
          <Grid alignItems='flex-start' container item justifyContent='flex-start' pt='5px' pb='15px' sx={{ border: '4px solid', borderColor: 'border.paper', borderRadius: '14px', mt: '5px', bgcolor: 'background.paper', height: '262px', px: '10px' }}>
            <Socials label={t('STAY TUNED')} short />
            <Stack columnGap='35px' direction='row' justifyItems='start' my='5px'>
              <Resources />
              <ContactUs />
            </Stack>
            <LegalDocuments />
          </Grid>
        </Grid>
      </Motion>
      <HomeMenu />
    </Container>
  );
}

export default React.memo(About);
