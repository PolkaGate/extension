// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { FadeOnScroll } from '@polkadot/extension-polkagate/src/components';
import { useNotifications, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import NotificationGroup from '@polkadot/extension-polkagate/src/popup/notification/partials/NotificationGroup';
import { ColdStartNotification, NoNotificationYet, NotificationLoading, OffNotificationMessage } from '@polkadot/extension-polkagate/src/popup/notification/partials/Partial';

import { DraggableModal } from '../components/DraggableModal';

interface Props {
  handleClose: () => void;
}

function Notification({ handleClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const modalBg = isDark ? '#1B133C' : theme.palette.background.paper;
  const emptyStateBg = isDark ? '#05091C' : '#FFFFFF';
  const emptyStateBorderColor = isDark ? 'transparent' : '#DDE3F4';
  const fadeBackground = isDark
    ? 'linear-gradient(0deg, #1B133C 0%, rgba(27, 19, 60, 0.65) 48%, rgba(27, 19, 60, 0) 100%)'
    : 'linear-gradient(0deg, #FFFFFF 0%, rgba(255, 255, 255, 0.65) 48%, rgba(255, 255, 255, 0) 100%)';

  const refContainer = useRef(null);
  const { markAsRead, notificationItems, status } = useNotifications();

  useEffect(() => {
    return () => {
      markAsRead().catch(console.error);
    };
  }, [markAsRead]);

  const closeNotifications = useCallback(() => {
    markAsRead().catch(console.error);
    handleClose();
  }, [handleClose, markAsRead]);

  const openSettings = useCallback(() => {
    navigate('/settingsfs/account') as void;
    closeNotifications();
  }, [closeNotifications, navigate]);

  return (
    <DraggableModal
      onClose={closeNotifications}
      open={true}
      showBackIconAsClose
      style={{ backgroundColor: modalBg, height: 'fit-content', minHeight: 'unset', overflow: 'auto', padding: ' 20px 10px' }}
      title={t('Notifications')}
    >
      <>
        <Box sx={{ position: 'relative', width: '100%' }}>
          <Container disableGutters ref={refContainer} sx={{ display: 'grid', gap: '4px', maxHeight: '490px', overflowY: 'auto', p: '10px', pb: 0, width: '100%' }}>
            {!status.isNotificationOff && notificationItems &&
              Object.entries(notificationItems).map(([dateKey, items]) => (
                <NotificationGroup
                  group={[dateKey, items]}
                  key={dateKey}
                />
              ))}
            {status.isNotificationOff &&
              <OffNotificationMessage
                onClick={openSettings}
                style={{
                  bgcolor: emptyStateBg,
                  border: '1px solid',
                  borderColor: emptyStateBorderColor,
                  borderRadius: '22px',
                  p: '32px 15px 22px'
                }}
              />}
            {status.isFirstTime &&
              <ColdStartNotification
                onClick={openSettings}
                style={{
                  bgcolor: emptyStateBg,
                  border: '1px solid',
                  borderColor: emptyStateBorderColor,
                  borderRadius: '22px',
                  p: '32px 15px 22px'
                }}
              />}
            {status.noNotificationYet &&
              <NoNotificationYet
                onClick={closeNotifications}
                style={{
                  bgcolor: emptyStateBg,
                  border: '1px solid',
                  borderColor: emptyStateBorderColor,
                  borderRadius: '22px',
                  p: '32px 15px 22px'
                }}
              />}
            {status.loading &&
              <NotificationLoading count={6} />}
          </Container>
          <FadeOnScroll
            containerRef={refContainer}
            height='48px'
            ratio={0.3}
            style={{ background: fadeBackground, borderRadius: '0 0 14px 14px', left: '10px', right: '10px', width: 'auto' }}
          />
        </Box>
      </>
    </DraggableModal>
  );
}

export default Notification;
