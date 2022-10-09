// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import { Avatar, Divider, Grid, IconButton, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { Chain } from '@polkadot/extension-chains/types';

import useToast from '../../../extension-ui/src/hooks/useToast';
import useTranslation from '../../../extension-ui/src/hooks/useTranslation';
import { copy1, eye } from '../assets/icons';
import '@vaadin/icons';

import { useApi, useEndpoint } from '../hooks';
import FormatBalance from './FormatBalance';
import FormatPrice from './FormatPrice';

interface Props {
  address: string | undefined | null;
  name: string | undefined;
  toggleVisibility: () => void;
  chain: Chain | null;
  price: number | undefined;
  balances: DeriveBalancesAll | undefined
  isHidden: boolean | undefined;
}

export default function AccountDetail({ address, balances, chain, isHidden, name, price, toggleVisibility }: Props): React.ReactElement<Props> {
  const { show } = useToast();
  const { t } = useTranslation();
  const theme = useTheme();
  const endpoint = useEndpoint(address, chain);
  const api = useApi(endpoint);
  const decimals = api ? api.registry.chainDecimals[0] : 1;

  const _onCopy = useCallback(
    () => show(t('Copied')),
    [show, t]
  );

  const NoChainAlert = () => (
    <Typography color='text.primary' variant='caption'>
      {t('Select a chain to view balance')}
    </Typography>
  );

  const Balance = () => (
    <>
      {!balances || !api
        ? <Skeleton height={22} sx={{ transform: 'none', my: '2.5px' }} variant='text' width={103} />
        : <FormatBalance api={api} decimalPoint={2} value={balances.freeBalance.add(balances.reservedBalance)} />
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
    <>
      <Grid
        fontSize='18px'
        fontWeight={300}
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
        fontSize='18px'
        fontWeight={300}
        item
      >
        <Price />
      </Grid>
    </>);

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
            fontWeight={300}
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
        <Grid item>
          <CopyToClipboard text={String(address)}>
            <IconButton
              onClick={_onCopy}
              sx={{ height: '23px', m: '10px 0', width: '36px' }}
            >
              <vaadin-icon icon='vaadin:copy-o' style={{ color: `${theme.palette.secondary.light}` }} />
            </IconButton>
          </CopyToClipboard>
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
