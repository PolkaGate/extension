// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import { Divider, Grid, IconButton, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { Chain } from '@polkadot/extension-chains/types';

import FormatBalance from '../components/FormatBalance';
import FormatBalance2 from '../components/FormatBalance2';
import FormatPrice from '../components/FormatPrice';
import { useTranslation } from '../hooks';
import { LastBalances } from '../util/types';
import CopyAddressButton from '../components/CopyAddressButton';

interface Props {
  api: ApiPromise | undefined
  address: string;
  formatted: string | undefined | null;
  name: string | undefined;
  toggleVisibility: () => void;
  chain: Chain | null;
  price: number | undefined;
  balances: DeriveBalancesAll | undefined
  isHidden: boolean | undefined;
  lastBalances: LastBalances | undefined

}

export default function AccountDetail({ address, api, balances, chain, formatted, isHidden, lastBalances, name, price, toggleVisibility }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const decimals = api ? api.registry.chainDecimals[0] : undefined;

  const NoChainAlert = () => (
    <Grid color='text.primary' fontSize={'14px'} fontWeight={500} letterSpacing='-1.5%'>
      {t('Select a chain to view balance')}
    </Grid>
  );

  const formattedBalance = (balances && api)
    ? <FormatBalance api={api} decimalPoint={2} value={balances.freeBalance.add(balances.reservedBalance)} />
    : lastBalances && <FormatBalance2 decimalPoint={2} decimals={lastBalances.decimals} tokens={lastBalances.tokens} value={lastBalances.freeBalance.add(lastBalances.reservedBalance)} />;

  const Balance = () => (
    <>
      {!formattedBalance
        ? <Skeleton height={22} sx={{ transform: 'none', my: '2.5px' }} variant='text' width={103} />
        : formattedBalance
      }
    </>
  );

  const Price = () => (
    <>
      {price === undefined || !balances || !decimals
        ? <Skeleton height={22} sx={{ transform: 'none', my: '2.5px' }} variant='text' width={90} />
        : <FormatPrice amount={balances.freeBalance.add(balances.reservedBalance)} decimals={decimals} price={price} />
      }
    </>
  );

  const BalanceRow = () => (
    <Grid
      container
      fontSize='18px'
      letterSpacing='-1.5%'
    >
      <Grid
        fontWeight={500}
        item
      >
        <Balance />
      </Grid>
      <Divider
        orientation='vertical'
        sx={{
          backgroundColor: 'text.primary',
          height: '19px',
          mx: '5px',
          my: 'auto'
        }}
      />
      <Grid
        fontWeight={300}
        item
      >
        <Price />
      </Grid>
    </Grid>);

  return (
    <Grid
      container
      direction='column'
      xs={7.5}
    >
      <Grid
        container
        direction='row'
        item
      >
        <Grid
          item
          maxWidth='65%'
        >
          <Typography
            fontSize='28px'
            overflow='hidden'
            textOverflow='ellipsis'
            whiteSpace='nowrap'
          >
            {name}
          </Typography>
        </Grid>
        <Grid item>
          <IconButton
            onClick={toggleVisibility}
            sx={{ height: '15px', mt: '13px', ml: '7px', p: 0, width: '24px' }}
          >
            <vaadin-icon icon={isHidden ? 'vaadin:eye-slash' : 'vaadin:eye'} style={{ height: '20px', color: `${theme.palette.secondary.light}` }} />
          </IconButton>
        </Grid>
        <Grid item sx={{ m: '10px 0' }}>
          <CopyAddressButton address={formatted || address} showAddress size={25} />
        </Grid>
      </Grid>
      <Grid
        alignItems='center'
        container
        item
      >
        {!chain
          ? <NoChainAlert />
          : <BalanceRow />
        }
      </Grid>
    </Grid>
  );
}
