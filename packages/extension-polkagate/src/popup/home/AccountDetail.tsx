// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Box, Divider, Grid, IconButton, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { stars5Black, stars5White } from '../../assets/icons';
import { CopyAddressButton, FormatBalance2, FormatPrice, Infotip } from '../../components';
import { useChainName, useTranslation } from '../../hooks';
import useBalances from '../../hooks/useBalances';
import usePrice from '../../hooks/usePrice';
import RecentChains from '../../partials/RecentChains';
import { BALANCES_VALIDITY_PERIOD } from '../../util/constants';
import { BalancesInfo } from '../../util/types';
import { getValue } from '../account/util';

interface Props {
  address: string;
  chain: Chain | null;
  formatted: string | undefined | null;
  hideNumbers: boolean | undefined;
  identity: DeriveAccountRegistration | null | undefined;
  isHidden: boolean | undefined;
  goToAccount: () => void;
  menuOnClick: () => void;
  name: string | undefined;
  toggleVisibility: () => void;
}

interface EyeProps {
  toggleVisibility: () => void;
  isHidden: boolean | undefined;
}

const EyeButton = ({ isHidden, toggleVisibility }: EyeProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Infotip text={isHidden && t('This account is hidden from websites')}    >
      <IconButton onClick={toggleVisibility} sx={{ height: '15px', ml: '7px', mt: '13px', p: 0, width: '24px' }}>
        <vaadin-icon icon={isHidden ? 'vaadin:eye-slash' : 'vaadin:eye'} style={{ color: `${theme.palette.secondary.light}`, height: '20px' }} />
      </IconButton>
    </Infotip>
  )
};

export default function AccountDetail({ address, chain, formatted, hideNumbers, identity, isHidden, goToAccount, menuOnClick, name, toggleVisibility }: Props): React.ReactElement<Props> {
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
    <Grid color='text.primary' onClick={menuOnClick} sx={{ cursor: 'pointer', fontSize: '14px', fontWeight: 500, lineHeight: '27px' }}>
      {t('Select a chain to view balance')}
      <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 10, mb: '-1px', stroke: '#BA2882' }} />
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
    <Grid alignItems='center' container fontSize='18px' item xs>
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
        <Grid item maxWidth='70%' onClick={goToAccount} sx={{ cursor: 'pointer' }}>
          <Typography fontSize='28px' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
            {identity?.display || name}
          </Typography>
        </Grid>
        <Grid item>
          <EyeButton
            isHidden={isHidden}
            toggleVisibility={toggleVisibility}
          />
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
          : <Grid alignItems='center' container>
            <RecentChains address={address} currentChainName={chainName} />
            <BalanceRow />
          </Grid>
        }
      </Grid>
    </Grid>
  );
}
