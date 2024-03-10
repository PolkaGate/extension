// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Grid } from '@mui/material';
import React, { useContext, useEffect } from 'react';

import { WarningAlertContext } from '../components';
import Alert from './Alert';

function WarningAlertBox(): React.ReactElement {
  const { setWarningAlerts, warningAlerts } = useContext(WarningAlertContext);

  useEffect(() => {
    let intervalId;

    if (warningAlerts.length > 0) {
      intervalId = setInterval(() => {
        setWarningAlerts((_warningAlerts) => [..._warningAlerts.slice(1)]);
      }, 6000);
    }

    if (warningAlerts.length === 0) {
      clearInterval(intervalId);
    }
  }, [setWarningAlerts, warningAlerts]);

  return (
    <Grid container display='flex' item sx={{ rowGap: '15px', position: 'absolute', right: '20px', top: '85px', width: '275px', zIndex: 100 }}>
      {warningAlerts.map((alert, index) =>
        <Alert
          alertMessage={alert}
          key={index}
        />
      )}
    </Grid>
  );
}

export default React.memo(WarningAlertBox);
