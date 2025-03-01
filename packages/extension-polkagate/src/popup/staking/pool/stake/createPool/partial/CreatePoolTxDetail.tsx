// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { PoolInfo, TxInfo } from '../../../../../../util/types';

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

import { AccountWithProxyInConfirmation } from '../../../../../../components';
import { useTranslation } from '../../../../../../hooks';

interface Props {
  txInfo: TxInfo;
  pool: PoolInfo;
}

export default function CreatePoolTxDetail({ pool, txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const token = txInfo.api?.registry.chainTokens[0];

  return (
    <>
      <AccountWithProxyInConfirmation
        txInfo={txInfo}
      />
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
      <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
          {t('Pool')}:
        </Typography>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
          {pool.metadata}
        </Typography>
      </Grid>
      <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
          {t('Index')}:
        </Typography>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
          {pool.poolId.toString()}
        </Typography>
      </Grid>
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
      <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
          {t('Staked')}:
        </Typography>
        <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
          {`${txInfo.amount} ${token}`}
        </Grid>
      </Grid>
    </>
  );
}
