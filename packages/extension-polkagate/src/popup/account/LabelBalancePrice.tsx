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

import { FormatBalance2, ShowBalance } from '../../components';
import { Price } from '../../util/types';
import { getValue } from './util';

interface Props {
  label: string;
  balances: DeriveBalancesAll | null | undefined;
  price: Price | undefined;
  api: ApiPromise | undefined;
  showLabel?: boolean;
}

export default function LabelBalancePrice({ api, balances, label, price, showLabel = true }: Props): React.ReactElement<Props> {
  const value = getValue(label, balances);
  const decimal = balances?.decimal || (api && api.registry.chainDecimals[0]);
  const balanceInUSD = price && value && decimal && Number(value) / (10 ** decimal) * price.amount;

  return (
    <>
      <Grid item py='5px'>
        <Grid alignItems='center' container justifyContent='space-between'>
          {showLabel &&
            <Grid item sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em', lineHeight: '36px' }} xs={3}>
              {label}
            </Grid>
          }
          <Grid container direction='column' item justifyContent='flex-end' xs>
            <Grid item sx={{ fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '20px' }} textAlign='right'>
              {balances?.decimal && balances?.token
                ? <FormatBalance2 decimals={[Number(balances?.decimal)]} tokens={[balances?.token]} value={value} />
                : <ShowBalance api={api} balance={value} decimalPoint={2} />
              }
            </Grid>
            <Grid item pt='6px' sx={{ fontSize: '16px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '15px' }} textAlign='right'>
              {balanceInUSD !== undefined
                ? `$${Number(balanceInUSD)?.toLocaleString()}`
                : <Skeleton sx={{ display: 'inline-block', fontWeight: 'bold', width: '90px', transform: 'none' }} height={15} />
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

