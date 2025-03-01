// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { AlertType } from '../util/types';

import { Alert as MuiAlert, Slide } from '@mui/material';
import React, { useCallback } from 'react';

import { useAlerts, useTranslation } from '../hooks';

interface Props {
  alert: AlertType;
}

function Alert({ alert }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { removeAlert } = useAlerts();

  const closeAlert = useCallback(() => {
    removeAlert(alert.id);
  }, [alert.id, removeAlert]);

  return (
    <Slide direction='left' in mountOnEnter unmountOnExit>
      <MuiAlert
        onClose={closeAlert}
        severity={alert.severity}
        sx={{ width: 'fit-content' }}
      >
        {t(alert.text)}
      </MuiAlert>
    </Slide>
  );
}

export default React.memo(Alert);
