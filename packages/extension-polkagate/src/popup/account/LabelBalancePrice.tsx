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

import { Divider, Grid, Skeleton } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import { FormatBalance2, ShowBalance } from '../../components';
import { BalancesInfo, Price } from '../../util/types';
import { getValue } from './util';

interface Props {
  label: string;
  balances: BalancesInfo | null | undefined;
  price: Price | undefined;
  api: ApiPromise | undefined;
  showLabel?: boolean;
}

export default function LabelBalancePrice({ api, balances, label, price, showLabel = true }: Props): React.ReactElement<Props> {
  const value = getValue(label, balances);
  const decimal = useMemo(() => (balances?.chainName === price?.chainName && balances?.decimal) || (api && api.registry.chainDecimals[0]), [api, balances?.chainName, balances?.decimal, price?.chainName]);

  const [balanceInUSD, setBalanceInUSD] = useState<number>();

  useEffect(() => {
    if (price && value && decimal) {
      setBalanceInUSD(Number(value) / (10 ** decimal) * price.amount);
    } else {
      setBalanceInUSD(undefined);
    }
  }, [decimal, price, value]);

  return (
    <>
      <Grid item py='5px'>
        <Grid alignItems='center' container justifyContent='space-between'>
          {showLabel &&
            <Grid item sx={{ fontSize: '16px', fontWeight: 300, lineHeight: '36px' }} xs={3}>
              {label}
            </Grid>
          }
          <Grid alignItems='flex-end' container direction='column' item xs>
            <Grid item sx={{ fontSize: '20px', fontWeight: 400, lineHeight: '20px' }} textAlign='right'>
              {balances?.decimal && balances?.token
                ? <FormatBalance2 decimals={[Number(balances?.decimal)]} tokens={[balances?.token]} value={value} />
                : <ShowBalance api={api} balance={value} decimalPoint={2} />
              }
            </Grid>
            <Grid item pt='6px' sx={{ fontSize: '16px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '15px' }} textAlign='right'>
              {balanceInUSD !== undefined
                ? `$${Number(balanceInUSD)?.toLocaleString()}`
                : <Skeleton height={15} sx={{ display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '90px' }} />
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
