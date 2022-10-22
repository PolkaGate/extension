// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows an account information in detail
 * */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import { Divider, Grid, Skeleton, Typography } from '@mui/material';
import React from 'react';

import { ShowBalance } from '../../components';
import { getValue } from './util';

interface Props {
  label: string;
  balances: DeriveBalancesAll | null | undefined;
  price: number | undefined;
  api: ApiPromise | undefined;
  showLabel?: boolean;
}

export default function LabelBalancePrice({ api, balances, label, price, showLabel = true }: Props): React.ReactElement<Props> {
  const value = getValue(label, balances);
  const balanceInUSD = price && value && api && Number(value) / (10 ** api.registry.chainDecimals[0]) * price;

  return (
    <>
      <Grid item py='5px'>
        <Grid alignItems='center' container justifyContent='space-between'>
          {showLabel &&
            <Grid item xs={3} sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em', lineHeight: '36px' }}>
              {label}
            </Grid>
          }
          <Grid container direction='column' item justifyContent='flex-end' xs>
            <Grid item textAlign='right' sx={{ fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '20px' }}>
              <ShowBalance api={api} balance={value} />
            </Grid>
            <Grid item pt='6px' textAlign='right' sx={{ fontSize: '16px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '15px' }}>
              {balanceInUSD !== undefined
                ? `$${Number(balanceInUSD)?.toLocaleString()}`
                : <Skeleton sx={{ display: 'inline-block', fontWeight: 'bold', width: '70px' }} />
              }
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {showLabel &&
        <Divider sx={{ bgcolor: 'secondary.main', height: '1px', my: '5px' }} />
      }
    </>
  );
}

