// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mui/material';
import React from 'react';
import { createPortal } from 'react-dom';

import { useAlerts, useTransactionStatus } from '../hooks';
import Alert from './Alert';

function AlertBox(): React.ReactElement {
  const { alerts } = useAlerts();
  const [portalEl, setPortalEl] = React.useState<HTMLElement | null>(null);

  useTransactionStatus();

  React.useEffect(() => {
    setPortalEl(document.getElementById('alert-root'));
  }, []);

  if (!portalEl) {
    return <></>;
  }

  return createPortal(
    <Box sx={{ alignItems: 'flex-end', display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', pointerEvents: 'none', position: 'fixed', right: '20px', top: '20px', width: 'calc(100% - 40px)', zIndex: 99999 }}>
      {alerts.map((alert) =>
        <Alert
          alert={alert}
          key={alert.id}
        />
      )}
    </Box>,
    portalEl
  );
}

export default React.memo(AlertBox);
