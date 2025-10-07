// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container } from '@mui/material';
import React, { useRef } from 'react';

import { useNotifications, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import NotificationGroup from '@polkadot/extension-polkagate/src/popup/notification/partials/NotificationGroup';

import { DraggableModal } from '../components/DraggableModal';

interface Props {
  handleClose: () => void;
}

function Notification ({ handleClose }: Props) {
  const { t } = useTranslation();

  const refContainer = useRef(null);
  const { notificationItems } = useNotifications();

  return (
    <DraggableModal
      onClose={handleClose}
      open={true}
      showBackIconAsClose
      style={{ backgroundColor: '#1B133C', minHeight: '600px', padding: ' 20px 10px 10px' }}
      title={t('Notifications')}
    >
      <Container disableGutters ref={refContainer} sx={{ display: 'grid', gap: '4px', maxHeight: '490px', overflowY: 'auto', p: '10px', pb: 0, width: '100%' }}>
        {notificationItems && Object.entries(notificationItems).map(([dateKey, items]) => (
          <NotificationGroup
            group={[dateKey, items]}
            key={dateKey}
          />
        ))}
      </Container>
    </DraggableModal>
  );
}

export default Notification;
