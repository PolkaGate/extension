// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, useTheme } from '@mui/material';
import React from 'react';

import { useTranslation } from '../hooks';
import { CanPayStatements } from '../util/types';
import { Warning } from '.';

export default function CanPayErrorAlert ({ canPayStatements }: { canPayStatements: CanPayStatements }): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Grid container height='35px'>
      <Warning
        fontWeight={400}
        isDanger
        marginTop={0}
        theme={theme}
      >
        {canPayStatements === CanPayStatements.CANNOTPAYFEE && t<string>('You do not have enough balance to pay fee for this transaction!')}
        {canPayStatements === CanPayStatements.PROXYCANPAYFEE && t<string>('Selected proxy account doesn\'t have enough balance to pay fee for this transaction!')}
        {(canPayStatements === CanPayStatements.CANNOTPAY || canPayStatements === CanPayStatements.CANNOTPAYDEPOSIT) &&
          t<string>('You do not have enough balance to pay the deposit amount for this transaction!')
        }
      </Warning>
    </Grid>
  );
}
