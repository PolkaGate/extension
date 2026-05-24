// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, useTheme } from '@mui/material';
import React from 'react';

import { useTranslation } from '../hooks';
import { CanPayStatements } from '../hooks/useCanPayFeeAndDeposit';
import { Warning } from '.';

interface Props {
  canPayStatements: CanPayStatements;
  extraText?: string;
}

export default function CanPayErrorAlert({ canPayStatements, extraText }: Props): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Grid alignItems='center' container height='35px'>
      <Warning
        fontWeight={400}
        isDanger
        marginTop={0}
        theme={theme}
      >
        {canPayStatements === CanPayStatements.CAN_NOT_PAY_FEE && t('Insufficient balance to cover transaction fee. {{extraText}}', { replace: { extraText: extraText || '' } })}
        {canPayStatements === CanPayStatements.PROXY_CAN_PAY_FEE && t('Selected proxy account lacks funds for the fee. {{extraText}}', { replace: { extraText: extraText || '' } })}
        {canPayStatements === CanPayStatements.CAN_NOT_PAY && t('Insufficient balance to complete the transaction. {{extraText}}', { replace: { extraText: extraText || '' } })}
        {canPayStatements === CanPayStatements.CAN_NOT_PAY_DEPOSIT && t('Insufficient balance for transaction deposit. {{extraText}}', { replace: { extraText: extraText || '' } })}
      </Warning>
    </Grid>
  );
}
