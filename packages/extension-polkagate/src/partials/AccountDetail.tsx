// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@vaadin/icons';


import { Divider, Grid, IconButton, Skeleton, Typography, useTheme } from '@mui/material';
import React from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import CopyAddressButton from '../components/CopyAddressButton';
import FormatBalance2 from '../components/FormatBalance2';
import FormatPrice from '../components/FormatPrice';
import { useTranslation } from '../hooks';
import useBalances from '../hooks/useBalances';
import usePrice from '../hooks/usePrice';

interface Props {
  address: string;
  formatted: string | undefined | null;
  name: string | undefined;
  toggleVisibility: () => void;
  chain: Chain | null;
  isHidden: boolean | undefined;
}

export default function AccountDetail({ address, chain, formatted, isHidden, name, toggleVisibility }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const balances = useBalances(address);
  const price = usePrice(address);

  const NoChainAlert = () => (
    <Grid
      color='text.primary'
      fontSize={'14px'}
      fontWeight={500}
      letterSpacing='-1.5%'>
      {t('Select a chain to view balance')}
    </Grid>
  );

  const Balance = () => (
    <>
      {balances?.decimal
        ? <FormatBalance2
          decimalPoint={2}
          decimals={[balances.decimal]}
          tokens={[balances.token]}
          value={balances.freeBalance.add(balances.reservedBalance)}
        />
        : <Skeleton
          height={22}
          sx={{ transform: 'none', my: '2.5px' }}
          variant='text'
          width={103}
        />
      }
    </>
  );

  const Price = () => (
    <>
      {price === undefined || !balances || balances?.token !== price?.token
        ? <Skeleton
          height={22}
          sx={{ transform: 'none', my: '2.5px' }}
          variant='text'
          width={90}
        />
        : <FormatPrice
          amount={balances.freeBalance.add(balances.reservedBalance)}
          decimals={balances.decimal}
          price={price.amount}
        />
      }
    </>
  );

  const BalanceRow = () => (
    <Grid container fontSize='18px' letterSpacing='-1.5%'    >
      <Grid fontWeight={500} item      >
        <Balance />
      </Grid>
      <Divider orientation='vertical' sx={{ backgroundColor: 'text.primary', height: '19px', mx: '5px', my: 'auto' }} />
      <Grid fontWeight={300} item      >
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
            sx={{ height: '15px', ml: '7px', mt: '13px', p: 0, width: '24px' }}
          >
            <vaadin-icon
              icon={isHidden ? 'vaadin:eye-slash' : 'vaadin:eye'}
              style={{ color: `${theme.palette.secondary.light}`, height: '20px' }}
            />
          </IconButton>
        </Grid>
        <Grid
          item
          sx={{ m: '10px 0' }}
        >
          <CopyAddressButton
            address={formatted || address}
            showAddress
            size={25}
          />
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
