// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Stack, type SxProps, type Theme, Typography } from '@mui/material';
import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { ActionButton, BackWithLabel, FadeOnScroll, Motion } from '@polkadot/extension-polkagate/src/components';
import { useBackground, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import useNotifications from '@polkadot/extension-polkagate/src/hooks/useNotifications';
import { HomeMenu, UserDashboardHeader, WhatsNew } from '@polkadot/extension-polkagate/src/partials';
import { VelvetBox } from '@polkadot/extension-polkagate/src/style';
import { EXTENSION_NAME } from '@polkadot/extension-polkagate/src/util/constants';

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

export const ColdStartNotification = ({ onClick, style }: { onClick: () => void; style?: SxProps<Theme>; }) => {
  const { t } = useTranslation();

  return (
    <Stack direction='column' sx={{ alignItems: 'center', gap: '16px', p: '32px 10px 15px', width: '100%', ...style }}>
      <Typography color='text.primary' textAlign='left' variant='B-2' width='100%'>
        {`${t('Introducing notifications')}!`}
      </Typography>
      <Typography color='text.secondary' textAlign='left' variant='B-1' width='100%'>
        {t('{{extensionName}} now has notifications! Important warnings and updates will be delivered to you as notifications, so make sure you don\'t miss any.',
          { replace: { extensionName: EXTENSION_NAME } })}
      </Typography>
      <Typography color='text.primary' textAlign='left' variant='B-1' width='100%'>
        {t('Fine-tune your notification experience in Settings')}:
      </Typography>
      <ActionButton
        onClick={onClick}
        style={{ mt: '15px', width: 'fit-content' }}
        text={t('Enable notifications')}
      />
    </Stack>
  );
};

function Notification () {
  useBackground('default');

  const refContainer = useRef(null);
  const { markAsRead, notificationItems, notificationSetting, notifications } = useNotifications();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => markAsRead(), [markAsRead]);

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
            {!notificationSetting.enable && !notifications.isFirstTime &&
              <OffNotificationMessage
                onClick={openSettings}
              />}
            {notifications.isFirstTime &&
              <ColdStartNotification
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
