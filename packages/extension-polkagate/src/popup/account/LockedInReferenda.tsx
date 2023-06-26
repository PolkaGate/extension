// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows an account information in detail
 * */

import LockClockIcon from '@mui/icons-material/LockClock';
import { Divider, Grid, Skeleton } from '@mui/material';
import React, { useMemo } from 'react';

import { BN } from '@polkadot/util';

import { Infotip, ShowBalance } from '../../components';
import { useApi, useDecimal, usePrice, useToken } from '../../hooks';

interface Props {
  label: string;
  amount: BN | undefined;
  address: string | undefined;
  showLabel?: boolean;
  unlockableAmount?: BN | undefined;
  timeToUnlock: string;
}

export default function LockedInReferenda({ address, amount, timeToUnlock, label, showLabel = true, unlockableAmount }: Props): React.ReactElement<Props> {
  const api = useApi(address);
  const price = usePrice(address);
  const decimal = useDecimal(address);
  const token = useToken(address);

  const balanceInUSD = useMemo(() =>
    price && decimal && amount &&
    Number(amount) / (10 ** decimal) * price.amount
    , [decimal, price, amount]);

  return (
    <>
      <Grid item py='4px'>
        <Grid alignItems='center' container justifyContent='space-between'>
          {showLabel &&
            <Grid item sx={{ fontSize: '16px', fontWeight: 300, lineHeight: '36px' }} xs={6}>
              {label}
            </Grid>
          }
          <Grid alignItems='flex-end' container direction='column' item xs>
            <Grid item sx={{ fontSize: '20px', fontWeight: 400, lineHeight: '20px' }} textAlign='right'>
              <ShowBalance api={api} balance={amount} decimal={decimal} decimalPoint={2} token={token} />
            </Grid>
            <Grid item pt='6px' sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em', lineHeight: '15px' }} textAlign='right'>
              {balanceInUSD !== undefined
                ? `$${Number(balanceInUSD)?.toLocaleString()}`
                : <Skeleton height={15} sx={{ display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '90px' }} />
              }
            </Grid>
          </Grid>
          {label === 'Locked in Referenda' &&
            <Grid alignItems='center' container item justifyContent='flex-end' xs={1.2}>
              <Infotip text={api && unlockableAmount && !unlockableAmount.isZero() ? api.createType('Balance', unlockableAmount).toHuman() : timeToUnlock}>
                <LockClockIcon sx={{ fontSize: '29px', color: !unlockableAmount || unlockableAmount.isZero() ? 'action.disabledBackground' : 'primary.main' }} />
              </Infotip>
            </Grid>
          }
        </Grid>
      </Grid>
      {showLabel &&
        <Divider sx={{ bgcolor: 'secondary.main', height: '1px', my: '5px' }} />
      }
    </>
  );
}
