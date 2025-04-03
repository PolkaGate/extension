// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


/**
 * @description
 * this component shows a balance and a fee
 * */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { BalancesInfo } from '../../../util/types';

import { Grid } from '@mui/material';
import React from 'react';

import { ShowBalance } from '../../../components';
import { useDecimal, useToken } from '../../../hooks';
import { FLOATING_POINT_DIGIT } from '../../../util/constants';
import { getValue } from '../../account/util';

interface Props {
  address?: string;
  type: string | undefined;
  balances: BalancesInfo | null | undefined;
  fee: Balance | undefined;
  api: ApiPromise | undefined;
  balance?: BN | null | undefined

}

export default function BalanceFee({ address, api, balance, balances, fee, type }: Props): React.ReactElement<Props> {
  const value = balance ?? (type ? getValue(type, balances) : undefined);
  const token = useToken(address);
  const decimal = useDecimal(address);

  return (
    <Grid alignItems='flex-end' container direction='column' item py='5px' xs>
      <Grid item sx={{ fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '20px' }} textAlign='right'>
        <ShowBalance
          api={api}
          balance={value}
          decimal={decimal}
          decimalPoint={FLOATING_POINT_DIGIT}
          token={token}
        />
      </Grid>
      <Grid item pt='6px' sx={{ fontSize: '16px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '15px' }} textAlign='right'>
        <ShowBalance
          api={api}
          balance={fee}
          decimal={decimal}
          decimalPoint={FLOATING_POINT_DIGIT}
          height={15}
          token={token}
        />
      </Grid>
    </Grid>
  );
}
