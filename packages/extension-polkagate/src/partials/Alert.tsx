// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { AlertType } from '../util/types';

import { Alert as MuiAlert, Slide } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from '../hooks';

interface Props {
  alert: AlertType;
}

function Alert ({ alert }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [showAlert, setShowAlert] = useState<boolean>(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowAlert(false);
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, []);

  const closeAlert = useCallback(() => setShowAlert(false), []);

  return (
    <Slide direction='left' in={showAlert} mountOnEnter unmountOnExit>
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
