// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Stack, type SxProps, type Theme,Typography } from '@mui/material';
import React, { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { ActionButton, BackWithLabel, FadeOnScroll, Motion } from '@polkadot/extension-polkagate/src/components';
import { useBackground, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import useNotifications from '@polkadot/extension-polkagate/src/hooks/useNotifications';
import { HomeMenu, UserDashboardHeader, WhatsNew } from '@polkadot/extension-polkagate/src/partials';
import { VelvetBox } from '@polkadot/extension-polkagate/src/style';

import NotificationGroup from './partials/NotificationGroup';

export const OffNotificationMessage = ({ onClick, style }: { onClick: () => void; style?: SxProps<Theme>; }) => {
  const { t } = useTranslation();

  return (
    <Stack direction='column' sx={{ alignItems: 'center', gap: '36px', p: '32px 10px', pb: '15px', width: '100%', ...style }}>
      <Typography color='text.secondary' variant='B-1' width='100%'>
        {t('You’ve turned off notifications. Enable them anytime to get updates on your accounts, governance, and staking rewards!')}
      </Typography>
      <ActionButton
        onClick={onClick}
        style={{ width: 'fit-content' }}
        text={t('Enable notifications')}
      />
    </Stack>
  );
};

function Notification () {
  useBackground('default');

  const refContainer = useRef(null);
  const { notificationItems, settings } = useNotifications();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const openSettings = useCallback(() => navigate('/notification/settings') as void, [navigate]);
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
            {!settings?.enable &&
              <OffNotificationMessage
                onClick={openSettings}
              />}
          </VelvetBox>
          <WhatsNew style={{ columnGap: '5px', paddingBottom: '50px', paddingTop: '24px' }} />
        </Container>
        <FadeOnScroll containerRef={refContainer} />
        <HomeMenu />
      </Motion>
    </Grid>
  );
}

export default Notification;
