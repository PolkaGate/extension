// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */

import { Box, Grid } from '@mui/material';
import { Notification as NotificationIcon } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useIsExtensionPopup, useNotifications } from '@polkadot/extension-polkagate/src/hooks';
import { ExtensionPopups } from '@polkadot/extension-polkagate/src/util/constants';
import { useExtensionPopups } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';

import Notification from '../../notification';

const NotificationButton = ({ hasNewNotification, onClick }: { hasNewNotification: boolean; onClick: () => void; }) => (
  <Grid alignItems='center' container item justifyContent='center' onClick={onClick}
    sx={{
      '&:hover': { background: '#674394' },
      '&:hover .notification-dot': { borderColor: '#674394' },
      backdropFilter: 'blur(20px)',
      background: '#2D1E4A80',
      borderRadius: '12px',
      boxShadow: '0px 0px 24px 8px #4E2B7259 inset',
      cursor: 'pointer',
      height: '32px',
      position: 'relative',
      transition: 'all 250ms ease-out',
      width: '32px'
    }}
  >
    <Box className='notification-dot'
      sx={{
        bgcolor: '#FF4FB9',
        border: '1.5px solid #2D1E4A',
        borderRadius: '50%',
        display: hasNewNotification ? 'block' : 'none',
        height: '9px',
        position: 'absolute',
        right: '5px',
        top: '5px',
        transition: 'border-color 200ms ease',
        width: '9px',
        zIndex: 1
      }}
    />
    <NotificationIcon
      color='#AA83DC'
      size='20'
      style={{ cursor: 'pointer', transform: 'rotate(30deg)' }}
      variant='Bold'
    />
  </Grid>
);

function Notifications (): React.ReactElement {
  const isExtension = useIsExtensionPopup();
  const navigate = useNavigate();
  const { extensionPopup, extensionPopupCloser, extensionPopupOpener } = useExtensionPopups();
  const { notificationItems } = useNotifications();

  const hasNewNotification = useMemo(() => {
    if (!notificationItems) {
      return false;
    }

    return Object.values(notificationItems).flat().some(({ read }) => !read);
  }, [notificationItems]);

  const onClick = useCallback(() => {
    if (isExtension) {
      navigate('/notification') as void;

      return;
    }

    extensionPopupOpener(ExtensionPopups.NOTIFICATION)();
  }, [extensionPopupOpener, isExtension, navigate]);

  return (
    <>
      <NotificationButton
        hasNewNotification={hasNewNotification}
        onClick={onClick}
      />
      {extensionPopup === ExtensionPopups.NOTIFICATION &&
        <Notification
          handleClose={extensionPopupCloser}
        />}
    </>
  );
}

export default React.memo(Notifications);
