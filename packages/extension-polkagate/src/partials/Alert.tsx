// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Alert as _Alert, Slide } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { useTranslation } from '../hooks';
import { AlertsType } from '../util/types';

interface Props {
  alert: AlertsType;
}

function Alert({ alert }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [showAlert, setShowAlert] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setShowAlert(false);
    }, 10000);
  }, []);

  return (
    <Slide direction='left' in={showAlert} mountOnEnter unmountOnExit>
      <_Alert severity={alert.type} sx={{ bgcolor: alert.type === 'warning' ? '#FFBF00' : '#DC143C', border: '2px solid', borderColor: 'warning.main', color: 'black', width: '100%' }}>
        {t(alert.message)}
      </_Alert>
    </Slide>
  );
}

export default React.memo(Alert);
