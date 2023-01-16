// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { Avatar, Box, Divider, Grid, IconButton, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { stars5Black, stars5White } from '../../assets/icons';
import CopyAddressButton from '../../components/CopyAddressButton';
import FormatBalance2 from '../../components/FormatBalance2';
import FormatPrice from '../../components/FormatPrice';
import { useChainName, useTranslation } from '../../hooks';
import useBalances from '../../hooks/useBalances';
import usePrice from '../../hooks/usePrice';
import { BALANCES_VALIDITY_PERIOD } from '../../util/constants';
import getLogo from '../../util/getLogo';
import { BalancesInfo } from '../../util/types';
import { getValue } from '../account/util';

interface Props {
  address: string;
  formatted: string | undefined | null;
  name: string | undefined;
  toggleVisibility: () => void;
  chain: Chain | null;
  isHidden: boolean | undefined;
  identity: DeriveAccountRegistration | null | undefined;
  hideNumbers: boolean | undefined;
}

export default function AccountDetail({ address, chain, formatted, hideNumbers, identity, isHidden, name, toggleVisibility }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const balances = useBalances(address);
  const chainName = useChainName(address);
  const price = usePrice(address);
  const isBalanceOutdated = useMemo(() => balances && Date.now() - balances.date > BALANCES_VALIDITY_PERIOD, [balances]);
  const isPriceOutdated = useMemo(() => price !== undefined && Date.now() - price.date > BALANCES_VALIDITY_PERIOD, [price]);
  const [balanceToShow, setBalanceToShow] = useState<BalancesInfo>();

  useEffect(() => {
    if (balances?.chainName === chainName) {
      return setBalanceToShow(balances);
    }

    setBalanceToShow(undefined);
  }, [balances, chainName]);

  const NoChainAlert = () => (
    <Grid color='text.primary' fontSize='14px' fontWeight={500} lineHeight='27px'>
      {t('Select a chain to view balance')}
    </Grid>
  );

  const Balance = () => (
    <>
      {balanceToShow?.decimal
        ? <Grid item sx={{ color: isBalanceOutdated ? 'primary.light' : 'text.primary', fontWeight: 500 }}>
          <FormatBalance2
            decimalPoint={2}
            decimals={[balanceToShow.decimal]}
            tokens={[balanceToShow.token]}
            value={getValue('total', balanceToShow)}
          />
        </Grid>
        : <Skeleton height={22} sx={{ my: '2.5px', transform: 'none' }} variant='text' width={90} />
      }
    </>
  );

  const Price = () => (
    <>
      {price === undefined || !balanceToShow || balanceToShow?.chainName?.toLowerCase() !== price?.chainName
        ? <Skeleton height={22} sx={{ my: '2.5px', transform: 'none' }} variant='text' width={80} />
        : <Grid item sx={{ color: isPriceOutdated ? 'primary.light' : 'text.primary', fontWeight: 300 }}>
          <FormatPrice
            amount={getValue('total', balanceToShow)}
            decimals={balanceToShow.decimal}
            price={price.amount}
          />
        </Grid>
      }
    </>
  );

  const BalanceRow = () => (
    <Grid alignItems='center' container fontSize='18px'>
      <Avatar src={getLogo(chain)} sx={{ filter: chainName === 'Kusama' && theme.palette.mode === 'dark' && 'invert(1)', borderRadius: '50%', height: 18, mr: '4px', width: 18 }} variant='square' />
      {hideNumbers || hideNumbers === undefined
        ? <Box
          component='img'
          src={(theme.palette.mode === 'dark' ? stars5White : stars5Black) as string}
          sx={{ height: '27px', width: '77px' }}
        />
        : <Balance />
      }
      <Divider orientation='vertical' sx={{ backgroundColor: 'text.primary', height: '19px', mx: '5px', my: 'auto' }} />
      {hideNumbers
        ? <Box
          component='img'
          src={(theme.palette.mode === 'dark' ? stars5White : stars5Black) as string}
          sx={{ height: '27px', width: '77px' }}
        />
        : <Price />
      }
    </Grid>
  );

  return (
    <Grid container direction='column' sx={{ width: '70%' }}>
      <Grid container direction='row' item sx={{ lineHeight: '20px' }}>
        <Grid item maxWidth='70%'>
          <Typography fontSize='28px' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
            {identity?.display || name}
          </Typography>
        </Grid>
        <Grid item>
          <IconButton onClick={toggleVisibility} sx={{ height: '15px', ml: '7px', mt: '13px', p: 0, width: '24px' }}>
            <vaadin-icon icon={isHidden ? 'vaadin:eye-slash' : 'vaadin:eye'} style={{ color: `${theme.palette.secondary.light}`, height: '20px' }} />
          </IconButton>
        </Grid>
        <Grid item sx={{ m: '10px 0' }}>
          <CopyAddressButton
            address={formatted || address}
            showAddress
            size={25}
          />
        </Grid>
      </Grid>
      <Grid alignItems='center' container item>
        {!chain
          ? <NoChainAlert />
          : <BalanceRow />
        }
      </Grid>
    </Grid>
  );
}
