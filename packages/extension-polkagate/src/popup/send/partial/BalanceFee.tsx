// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component shows a balance and a fee
 * */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Balance } from '@polkadot/types/interfaces';

import { Grid } from '@mui/material';
import React from 'react';

import { BN } from '@polkadot/util';

import { ShowBalance } from '../../../components';
import { getValue } from '../../account/util';

interface Props {
  type: string;
  balances: DeriveBalancesAll | null | undefined;
  fee: Balance | undefined;
  api: ApiPromise | undefined;
  balance?: BN | undefined

}

export default function BalanceFee({ api, balance, balances, fee, type }: Props): React.ReactElement<Props> {
  const value = balance ?? getValue(type, balances);

  return (
    <Grid
      container
      direction='column'
      item
      justifyContent='flex-end'
      py='5px'
      xs
    >
      <Grid
        item
        sx={{ fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '20px' }}
        textAlign='right'
      >
        <ShowBalance
          api={api}
          balance={value}
          decimalPoint={2}
        />
      </Grid>
      <Grid
        item
        pt='6px'
        sx={{ fontSize: '16px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '15px' }}
        textAlign='right'
      >
        <ShowBalance
          api={api}
          balance={fee}
          decimalPoint={4}
          height={15}
        />
      </Grid>
    </Grid>
  );
}
