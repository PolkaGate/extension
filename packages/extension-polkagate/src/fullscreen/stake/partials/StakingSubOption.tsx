// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { BN } from '@polkadot/util';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React from 'react';

import { ShowBalance, Warning } from '../../../components';
import { pgBoxShadow } from '../../../util/utils';

interface OptionProps {
  api?: ApiPromise;
  balance?: BN;
  title: string;
  text?: string;
  balanceText: string;
  onClick: () => void;
  style?: SxProps<Theme> | undefined;
  warningText?: string;
  logo?: unknown;
}

export default function StakingSubOption({ api, balance, balanceText, logo, onClick, style, title, warningText }: OptionProps): React.ReactElement {
  const theme = useTheme();

  return (
    <Grid alignItems='center' container justifyContent='space-between' onClick={onClick} sx={{ backgroundColor: 'background.paper', borderRadius: '5px', boxShadow: pgBoxShadow(theme), cursor: 'pointer', p: '10px 14px', ...style }}>
      <Grid alignItems='center' container item xs={4.5}>
        <Grid item mr='10px' width='fit-content'>
          {logo as any}
        </Grid>
        <Grid item>
          <Typography color='secondary.light' fontSize='20px' fontWeight={500}>
            {title}
          </Typography>
        </Grid>
      </Grid>
      <Grid alignItems='center' container item justifyContent='flex-end' xs={6.5}>
        <Grid container item xs>
          <Grid item mr='10px'>
            <Typography fontSize='14px' fontWeight={400}>
              {balanceText}
            </Typography>
          </Grid>
          <Grid item sx={{ fontSize: '14px', fontWeight: 400 }}>
            <ShowBalance
              api={api}
              balance={balance}
            />
          </Grid>
        </Grid>
        <Grid item xs={1}>
          <ArrowForwardIosIcon
            sx={{
              color: 'secondary.light',
              fontSize: 36,
              stroke: theme.palette.secondary.light,
              strokeWidth: 1
            }}
          />
        </Grid>
      </Grid>
      {warningText &&
        <Grid container item justifyContent='center' sx={{ '> div': { mt: '5px' } }}>
          <Warning
            fontWeight={400}
            isDanger
            theme={theme}
          >
            {warningText}
          </Warning>
        </Grid>
      }
    </Grid>
  );
}
