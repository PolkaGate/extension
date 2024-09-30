// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Grid } from '@mui/material';
import React, { useEffect } from 'react';

import { useAlerts, useTransactionState } from '../hooks';
import Alert from './Alert';

const TIME_TO_REMOVE_ALERT = 5000;

function AlertBox (): React.ReactElement {
  const { alerts, removeAlert } = useAlerts();

  useTransactionState();

  useEffect(() => {
    alerts.forEach((_, index) => {
      const timeout = setTimeout(
        () => removeAlert(index)
        , TIME_TO_REMOVE_ALERT);

      return () => clearTimeout(timeout);
    });
  }, [alerts, removeAlert]);

  return (
    <Grid container display='flex' item justifyContent='flex-end' sx={{ maxWidth: '500px', position: 'absolute', right: '20px', rowGap: '15px', top: '85px', zIndex: 100 }}>
      {alerts.map((alert, index) =>
        <Alert
          alert={alert}
          key={index}
        />
      )}
    </Grid>
  );
}

export default React.memo(AlertBox);
