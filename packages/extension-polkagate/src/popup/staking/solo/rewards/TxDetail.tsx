// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TxInfo } from '../../../../util/types';

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

import { AccountWithProxyInConfirmation } from '../../../../components';
import { useTranslation } from '../../../../hooks';

interface Props {
  txInfo: TxInfo;
}

export default function TxDetail({ txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const token = txInfo.api?.registry.chainTokens[0];

  return (
    <>
      <AccountWithProxyInConfirmation
        txInfo={txInfo}
      />
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
      <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
          {t('Payout')}:
        </Typography>
        <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
          {`${txInfo.amount} ${token}`}
        </Grid>
      </Grid>
    </>
  );
}
