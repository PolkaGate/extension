// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mui/material';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';

import { noop } from '@polkadot/util';

import { useAlerts, useApi, useIsExtensionPopup, useSelectedChains, useSlowEndpointAlert, useTransactionStatus } from '../hooks';
import Endpoints from '../fullscreen/settings/partials/Endpoints';
import Alert from './Alert';

/** Extract the first 0x… hex segment from the current URL path — that's the genesisHash. */
function useGenesisHashFromPath(): string | undefined {
  const { pathname } = useLocation();
  const match = pathname.match(/(0x[0-9a-fA-F]{64})/);

  return match?.[1];
}

function AlertBox(): React.ReactElement {
  const { alerts } = useAlerts();
  const [portalEl, setPortalEl] = React.useState<HTMLElement | null>(null);
  const isExtension = useIsExtensionPopup();
  const selectedChains = useSelectedChains();
  const [showEndpointsModal, setShowEndpointsModal] = useState(false);

  const genesisHash = useGenesisHashFromPath();
  const api = useApi(genesisHash);

  // Single global call — fires the endpoint alert once for the active chain
  useSlowEndpointAlert(genesisHash, api, undefined, isExtension ? undefined : () => setShowEndpointsModal(true));

  useTransactionStatus();

  React.useEffect(() => {
    setPortalEl(document.getElementById('alert-root'));
  }, []);

  if (!portalEl) {
    return <></>;
  }

  return createPortal(
    <>
      <Box sx={{ alignItems: 'flex-end', display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', pointerEvents: 'none', position: 'fixed', right: '20px', top: '20px', width: 'calc(100% - 40px)', zIndex: 99999 }}>
        {alerts.map((alert) =>
          <Alert
            alert={alert}
            key={alert.id}
          />
        )}
      </Box>
      {!isExtension && showEndpointsModal && genesisHash &&
        <Endpoints
          genesisHash={genesisHash}
          isEnabled={selectedChains?.includes(genesisHash) ?? true}
          onClose={() => setShowEndpointsModal(false)}
          onEnableChain={noop}
          open={showEndpointsModal}
        />
      }
    </>,
    portalEl
  );
}

export default React.memo(AlertBox);
