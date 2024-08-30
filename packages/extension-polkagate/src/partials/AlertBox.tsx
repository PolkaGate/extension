// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Grid } from '@mui/material';
import React, { useContext } from 'react';

import { AlertContext } from '../components';
import { useTransactionState } from '../hooks';
import Alert from './Alert';

function AlertBox (): React.ReactElement {
  const { alerts } = useContext(AlertContext);

  useTransactionState();

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
