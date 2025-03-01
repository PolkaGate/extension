// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { BalancesInfo } from '../../util/types';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Box, Divider, Grid, IconButton, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import { stars5Black, stars5White } from '../../assets/icons';
import { FormatBalance2, FormatPrice, Infotip, OptionalCopyButton, VaadinIcon } from '../../components';
import { useBalances, useChainName, useTokenPrice, useTranslation } from '../../hooks/';
import RecentChains from '../../partials/RecentChains';
import { BALANCES_VALIDITY_PERIOD } from '../../util/constants';
import { getValue } from '../account/util';

interface Props {
  address: string;
  chain: Chain | null | undefined;
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
    <Infotip text={isHidden ? t('This account is hidden from websites') : t('This account is visible to websites')}>
      <IconButton onClick={toggleVisibility} sx={{ height: '15px', ml: '7px', mt: '13px', p: 0, width: '24px' }}>
        <VaadinIcon icon={isHidden ? 'vaadin:eye-slash' : 'vaadin:eye'} style={{ color: `${theme.palette.secondary.light}`, height: '17px' }} />
      </IconButton>
    </Infotip>
  );
};

const NoChainAlert = ({ chain, menuOnClick }: { chain: Chain | null | undefined, menuOnClick: () => void }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <>
      {chain === null
        ? <Grid alignItems='center' color='text.primary' container onClick={menuOnClick} sx={{ cursor: 'pointer', lineHeight: '27px', textDecoration: 'underline' }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
            {t('Select a chain to view balance')}
          </Typography>
          <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 12, mb: '-1px', stroke: theme.palette.secondary.light }} />
        </Grid>
        : <Skeleton animation='wave' height={22} sx={{ my: '2.5px', transform: 'none' }} variant='text' width={'95%'} />
      }
    </>
  );
};

const Price = React.memo(function Price({ balanceToShow, isPriceOutdated, price, priceChainName }: { isPriceOutdated: boolean, price: number | undefined, priceChainName: string | undefined, balanceToShow: BalancesInfo | undefined }) {
  return (
    <>
      {priceChainName === undefined || !balanceToShow || balanceToShow?.chainName?.toLowerCase() !== priceChainName
        ? <Skeleton animation='wave' height={22} sx={{ my: '2.5px', transform: 'none' }} variant='text' width={80} />
        : <FormatPrice
          amount={getValue('total', balanceToShow)}
          decimals={balanceToShow.decimal}
          fontSize='18px'
          fontWeight={300}
          price={price}
          textColor={isPriceOutdated ? 'primary.light' : 'text.primary'}
        />
      }
    </>
  );
});

const Balance = React.memo(function Balance({ balanceToShow, isBalanceOutdated }: { balanceToShow: BalancesInfo | undefined, isBalanceOutdated: boolean | undefined }) {
  return (
    <>
      {balanceToShow?.decimal
        ? <Grid item sx={{ color: isBalanceOutdated ? 'primary.light' : 'text.primary', fontWeight: 400 }}>
          <FormatBalance2
            decimalPoint={2}
            decimals={[balanceToShow.decimal]}
            tokens={[balanceToShow.token]}
            value={getValue('total', balanceToShow)}
          />
        </Grid>
        : <Skeleton animation='wave' height={22} sx={{ my: '2.5px', transform: 'none' }} variant='text' width={90} />
      }
    </>
  );
});

const BalanceRow = ({ address, hideNumbers }: { address: string, hideNumbers: boolean | undefined }) => {
  const theme = useTheme();

  const balances = useBalances(address);
  const chainName = useChainName(address);

  const { price, priceChainName, priceDate } = useTokenPrice(address);
  const isPriceOutdated = useMemo(() => priceDate !== undefined && Date.now() - priceDate > BALANCES_VALIDITY_PERIOD, [priceDate]);
  const isBalanceOutdated = useMemo(() => balances && Date.now() - balances.date > BALANCES_VALIDITY_PERIOD, [balances]);

  const [balanceToShow, setBalanceToShow] = useState<BalancesInfo>();

  useEffect(() => {
    if (balances?.chainName === chainName) {
      return setBalanceToShow(balances);
    }

    setBalanceToShow(undefined);
  }, [balances, chainName]);

  return (
    <Grid alignItems='center' container fontSize='18px' item xs>
      {hideNumbers || hideNumbers === undefined
        ? <Box
          component='img'
          src={(theme.palette.mode === 'dark' ? stars5White : stars5Black) as string}
          sx={{ height: '27px', width: '77px' }}
        />
        : <Balance
          balanceToShow={balanceToShow}
          isBalanceOutdated={isBalanceOutdated}
        />
      }
      <Divider orientation='vertical' sx={{ backgroundColor: 'divider', height: '19px', mx: '5px', my: 'auto' }} />
      {hideNumbers
        ? <Box
          component='img'
          src={(theme.palette.mode === 'dark' ? stars5White : stars5Black) as string}
          sx={{ height: '27px', width: '77px' }}
        />
        : <Price
          balanceToShow={balanceToShow}
          isPriceOutdated={isPriceOutdated}
          price={price}
          priceChainName={priceChainName}
        />
      }
    </Grid>
  );
};

function AccountDetail({ address, chain, goToAccount, hideNumbers, identity, isHidden, menuOnClick, name, toggleVisibility }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const chainName = useChainName(address);

  return (
    <Grid container direction='column' sx={{ width: '70%' }}>
      <Grid container direction='row' item sx={{ lineHeight: '20px' }}>
        <Grid item maxWidth='70%' onClick={goToAccount} sx={{ cursor: 'pointer' }}>
          <Typography fontSize='18px' fontWeight={400} mt='7px' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
            {identity?.display || name || t('Unknown')}
          </Typography>
        </Grid>
        <Grid item>
          <EyeButton
            isHidden={isHidden}
            toggleVisibility={toggleVisibility}
          />
        </Grid>
        <Grid item sx={{ m: '10px 0', width: 'fit-content' }}>
          <OptionalCopyButton address={address} iconWidth={15} />
        </Grid>
      </Grid>
      <Grid alignItems='center' container item>
        {!chain
          ? <NoChainAlert
            chain={chain}
            menuOnClick={menuOnClick}
          />
          : <Grid alignItems='center' container>
            <RecentChains address={address} chainName={chainName} />
            <BalanceRow
              address={address}
              hideNumbers={hideNumbers}
            />
          </Grid>
        }
      </Grid>
    </Grid>
  );
}

export default React.memo(AccountDetail);
