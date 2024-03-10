// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Alert } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { WarningAlertContext } from '../components';
import { useTranslation } from '../hooks';

function WarningAlert (): React.ReactElement {
  const { t } = useTranslation();
  const { setWarningAlert, warningAlert } = useContext(WarningAlertContext);

  const [show, setShow] = useState(false);

  const resetWaringAlert = useCallback(() => {
    setShow(false);
    setTimeout(() => setWarningAlert(undefined), 400);
  }, [setWarningAlert]);

  useEffect(() => {
    setShow(true);
    setTimeout(() => resetWaringAlert(), 110000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Alert severity='warning' sx={{ bgcolor: '#e9c29a', border: '2px solid', borderColor: 'warning.main', color: 'black', position: 'absolute', right: '-250px', top: '85px', transform: show ? 'translateX(-280px)' : 'transform(0)', transition: 'all 300ms', width: '250px' }}>
      {t(warningAlert ?? '')}
    </Alert>
  );
}

export default React.memo(WarningAlert);
