// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Alert as _Alert, Slide } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useTranslation } from '../hooks';
import { AlertsType } from '../util/types';

interface Props {
  alert: AlertsType;
}

function Alert ({ alert }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [showAlert, setShowAlert] = useState<boolean>(true);

  const { bgcolor, borderColor } = useMemo(() => {
    switch (alert.type) {
      case 'warning':
        return { bgcolor: '#FFBF00', borderColor: '#FF5722 ' };

      case 'error':
        return { bgcolor: '#DC143C', borderColor: '#FF5252 ' };

      case 'info':
        return { bgcolor: '#89CFF0', borderColor: '#6495ED' };

      default:
        return { bgcolor: '#fff', borderColor: '#fff' };
    }
  }, [alert.type]);

  useEffect(() => {
    setTimeout(() => {
      setShowAlert(false);
    }, 10000);
  }, []);

  const closeAlert = useCallback(() => setShowAlert(false), []);

  return (
    <Slide direction='left' in={showAlert} mountOnEnter unmountOnExit>
      <_Alert
        onClose={closeAlert}
        severity={alert.type}
        sx={{ bgcolor, border: '2px solid', borderColor, color: 'black', width: '100%' }}
      >
        {t(alert.message)}
      </_Alert>
    </Slide>
  );
}

export default React.memo(Alert);
