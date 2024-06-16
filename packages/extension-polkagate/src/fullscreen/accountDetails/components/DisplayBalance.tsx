// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Collapse, Divider, Grid, IconButton, Skeleton, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { noop } from '@polkadot/extension-polkagate/src/util/utils';
import { BN } from '@polkadot/util';

import { FormatPrice, ShowBalance } from '../../../components';

interface Props {
  amount: BN | Balance | undefined;
  title: string;
  token: string | undefined;
  decimal: number | undefined;
  price: number | undefined;
  onClick?: () => void;
  disabled?: boolean;
  openCollapse?: boolean;
}

export default function DisplayBalance({ amount, decimal, disabled, onClick, price, openCollapse, title, token }: Props): React.ReactElement {
  const theme = useTheme();

  return (
    <Grid alignItems='center' container item justifyContent='space-between' sx={{ bgcolor: 'background.paper', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', p: '15px 40px' }}>
      <Typography fontSize='18px' fontWeight={400}>
        {title}
      </Typography>
      <Grid alignItems='center' container item width='fit-content'>
        <Grid item sx={{ fontSize: '22px', fontWeight: 600 }}>
          <ShowBalance
            balance={amount}
            decimal={decimal}
            decimalPoint={3}
            token={token}
            withCurrency
          />
        </Grid>
        <Divider orientation='vertical' sx={{ backgroundColor: 'text.primary', height: '35px', mx: '10px', my: 'auto' }} />
        <Grid item sx={{ '> div span': { display: 'block' }, fontSize: '22px', fontWeight: 400 }}>
          <FormatPrice
            amount={amount}
            decimals={decimal}
            price={price}
            skeletonHeight={20}
          />
        </Grid>
        {onClick &&
          <Grid item m='auto' pl='8px'>
            <IconButton
              disabled={disabled}
              onClick={onClick}
              sx={{ p: '8px' }}
            >
              <ArrowForwardIosRoundedIcon
                sx={{
                  color: disabled ? 'action.disabledBackground' : 'secondary.light',
                  fontSize: '24px',
                  stroke: `${disabled ? theme.palette.action.disabledBackground : theme.palette.secondary.light}`,
                  strokeWidth: 1.5,
                  transform:
                    openCollapse !== undefined
                      ? openCollapse
                        ? 'rotate(-90deg)'
                        : 'rotate(90deg)'
                      : 'none',
                  transitionDuration: '0.3s',
                  transitionProperty: 'transform'
                }}
              />
            </IconButton>
          </Grid>
        }
      </Grid>
    </Grid>
  );
}
