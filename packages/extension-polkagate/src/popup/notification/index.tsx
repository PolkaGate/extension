// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid } from '@mui/material';
import React, { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { BackWithLabel, FadeOnScroll, Motion } from '@polkadot/extension-polkagate/src/components';
import { useBackground, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import useNotifications from '@polkadot/extension-polkagate/src/hooks/useNotifications';
import { HomeMenu, UserDashboardHeader, WhatsNew } from '@polkadot/extension-polkagate/src/partials';
import { VelvetBox } from '@polkadot/extension-polkagate/src/style';

import NotificationGroup from './partials/NotificationGroup';

function Notification () {
  useBackground('default');

  const refContainer = useRef(null);
  const { notificationItems } = useNotifications();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const backHome = useCallback(() => navigate('/') as void, [navigate]);

  return (
    <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <BackWithLabel
        onClick={backHome}
        style={{ pb: 0 }}
        text={t('Notifications')}
      />
      <Motion variant='slide'>
        <Container disableGutters ref={refContainer} sx={{ maxHeight: '480px', overflowY: 'auto', padding: '15px', width: '100%' }}>
          <VelvetBox childrenStyle={{ display: 'grid', gap: '4px' }}>
            {notificationItems && Object.entries(notificationItems).map(([dateKey, items]) => (
              <NotificationGroup
                group={[dateKey, items]}
                key={dateKey}
              />
            ))}
          </VelvetBox>
          <WhatsNew style={{ columnGap: '5px', paddingBottom: '75px', paddingTop: '24px' }} />
        </Container>
        <FadeOnScroll containerRef={refContainer} />
        <HomeMenu />
      </Motion>
    </Grid>
  );
}

export default Notification;
