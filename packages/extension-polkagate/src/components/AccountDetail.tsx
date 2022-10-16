// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';
import type { ApiPromise } from '@polkadot/api';

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import { Divider, Grid, IconButton, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';

import { useApi, useEndpoint, useToast, useTranslation } from '../hooks';
import { updateMeta } from '../messaging';
import { prepareMetaData } from '../util/utils';
import FormatBalance from './FormatBalance';
import FormatPrice from './FormatPrice';

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
  lastTotalBalance: BN | undefined

}

export default function AccountDetail({ api, address, balances, chain, formatted, isHidden, lastTotalBalance, name, price, toggleVisibility }: Props): React.ReactElement<Props> {
  const { show } = useToast();
  const { t } = useTranslation();
  const theme = useTheme();
  const decimals = api ? api.registry.chainDecimals[0] : undefined;

  const _onCopy = useCallback(
    () => show(t('Copied')),
    [show, t]
  );

  const NoChainAlert = () => (
    <Grid color='text.primary' fontSize={'14px'} fontWeight={500} letterSpacing='-1.5%'>
      {t('Select a chain to view balance')}
    </Grid>
  );

  console.log('lastTotalBalance:', lastTotalBalance);
  console.log('balances:', balances);
  console.log('api:', api);

  const formattedBalance = (balances || lastTotalBalance) && api &&
    <FormatBalance
      api={api}
      decimalPoint={2}
      value={balances
        ? balances.freeBalance.add(balances.reservedBalance)
        : lastTotalBalance}
    />;

  useEffect((): void => {
    if (balances && chain) {
      const totalBalance = balances.freeBalance.add(balances.reservedBalance).toString();

      console.log('saving balance to ' + totalBalance)
      // eslint-disable-next-line no-void
      void updateMeta(address, prepareMetaData(chain, 'totalBalance', totalBalance));
    }
  }, [address, balances, chain]);

  const Balance = () => (
    <>
      {!formattedBalance || !api
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
        <Grid item>
          <CopyToClipboard text={String(formatted)}>
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
