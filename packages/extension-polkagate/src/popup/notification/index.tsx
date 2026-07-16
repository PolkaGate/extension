// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { BackWithLabel, FadeOnScroll, Motion } from '@polkadot/extension-polkagate/src/components';
import { useBackground, useIsSidePanel, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import useNotifications from '@polkadot/extension-polkagate/src/hooks/useNotifications';
import { HomeMenu, UserDashboardHeader, WhatsNew } from '@polkadot/extension-polkagate/src/partials';
import { VelvetBox } from '@polkadot/extension-polkagate/src/style';

import NotificationGroup from './partials/NotificationGroup';
import { ColdStartNotification, NoNotificationYet, NotificationLoading, OffNotificationMessage } from './partials/Partial';

function Notification() {
  useBackground('default') as void;

  const theme = useTheme();
  const fadeBackgroundColor = theme.palette.background.default;
  const refContainer = useRef(null);
  const isSidePanel = useIsSidePanel();
  const { markAsRead, notificationItems, status } = useNotifications();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { isFirstTime, isNotificationOff, loading, noNotificationYet } = status;

  useEffect(() => {
    return () => {
      markAsRead().catch(console.error);
    };
  }, [markAsRead]);

  const openSettings = useCallback(() => navigate('/notification/settings') as void, [navigate]);
  const backHome = useCallback(() => {
    markAsRead().catch(console.error);
    navigate('/') as void;
  }, [markAsRead, navigate]);

  return (
    <Grid alignContent='flex-start' container sx={{ flexDirection: isSidePanel ? 'column' : undefined, flexWrap: isSidePanel ? 'nowrap' : undefined, height: isSidePanel ? '100vh' : undefined, overflow: isSidePanel ? 'hidden' : undefined, pb: isSidePanel ? '86px' : undefined, position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <BackWithLabel
        onClick={backHome}
        style={{ pb: 0 }}
        text={t('Notifications')}
      />
      <Motion style={isSidePanel ? { display: 'flex', flex: '1 1 auto', flexDirection: 'column', minHeight: 0, overflow: 'hidden' } : undefined} variant='slide'>
        <Container disableGutters ref={refContainer} sx={{ flex: isSidePanel ? '1 1 auto' : undefined, maxHeight: isSidePanel ? 'none' : '480px', minHeight: isSidePanel ? 0 : undefined, overflowY: 'auto', padding: '15px', width: '100%' }}>
          <VelvetBox childrenStyle={{ display: 'grid', gap: '4px' }}>
            {!isNotificationOff && notificationItems && Object.entries(notificationItems).map(([dateKey, items]) => (
              <NotificationGroup
                group={[dateKey, items]}
                key={dateKey}
              />
            ))}
            {isNotificationOff &&
              <OffNotificationMessage
                onClick={openSettings}
              />}
            {isFirstTime &&
              <ColdStartNotification
                onClick={openSettings}
              />}
            {noNotificationYet &&
              <NoNotificationYet
                onClick={backHome}
              />}
            {loading &&
              <NotificationLoading count={5} />}
          </VelvetBox>
          <WhatsNew style={{ columnGap: '5px', paddingBottom: '50px', paddingTop: '24px' }} />
        </Container>
        <FadeOnScroll
          backgroundColor={fadeBackgroundColor}
          containerRef={refContainer}
          height='96px'
          style={{
            WebkitBackdropFilter: 'none',
            backdropFilter: 'none',
            background: `linear-gradient(0deg, ${fadeBackgroundColor} 0%, ${fadeBackgroundColor}F2 68%, ${fadeBackgroundColor}80 88%, ${fadeBackgroundColor}00 100%)`
          }}
        />
      </Motion>
      <HomeMenu />
    </Grid>
  );
}

export default Notification;
