// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import { BN } from '@polkadot/util';

import { hide, show, stars6Black, stars6White } from '../../assets/icons';
import { AccountContext, FormatPrice } from '../../components';
import { usePrices } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import { MILLISECONDS_TO_UPDATE } from '../../util/constants';
import { SavedBalances } from '../../util/types';

interface Props {
  hideNumbers: boolean | undefined;
  setHideNumbers: React.Dispatch<React.SetStateAction<boolean | undefined>>
}

export default function YouHave({ hideNumbers, setHideNumbers }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const theme = useTheme();
  const pricesInfo = usePrices();
  const isPriceOutdated = useMemo((): boolean | undefined => {
    if (!pricesInfo) {
      return undefined;
    }

    return (Date.now() - pricesInfo.date > MILLISECONDS_TO_UPDATE);
  }, [pricesInfo]);

  const allYouHaveAmount = useMemo((): number | undefined => {
    if (!accounts || pricesInfo === undefined) {
      return undefined;
    }

    if (pricesInfo === null) {
      return 0;
    }

    let value = 0;

    pricesInfo?.prices && accounts.forEach((acc) => {
      if (!acc?.balances) {
        return;
      }

      const balances = JSON.parse(acc.balances) as SavedBalances;

      Object.keys(balances).forEach((chainName) => {
        // const localSavedPrices = window.localStorage.getItem('prices');

        const price = (pricesInfo.prices[chainName] || pricesInfo.prices[chainName.toLocaleLowerCase()])?.usd;

        const bal = balances[chainName];

        if (bal && price) {
          const total = new BN(balances[chainName].balances.freeBalance)
            .add(new BN(balances[chainName].balances.reservedBalance))
            .add(new BN(balances[chainName].balances.pooledBalance));

          value += price * (Number(total) * 10 ** -bal.decimal);
        }
      });
    });

    return value;
  }, [accounts, pricesInfo]);

  const onHideClick = useCallback(() => {
    setHideNumbers(!hideNumbers);
    window.localStorage.setItem('hide_numbers', hideNumbers ? 'false' : 'true');
  }, [hideNumbers, setHideNumbers]);

  useEffect(() => {
    const isHide = window.localStorage.getItem('hide_numbers');

    isHide === 'false' || isHide === null ? setHideNumbers(false) : setHideNumbers(true);
  }, [setHideNumbers]);

  return (
    <Grid container pt='15px' textAlign='center' sx={{ position: 'relative', zIndex: 1 }}>
      <Grid item xs={12}>
        <Typography sx={{ fontSize: '18px' }}>
          {t('You have')}
        </Typography>
      </Grid>
      <Grid container item justifyContent='center' xs={12}>
        {hideNumbers || hideNumbers === undefined
          ? <Box
            component='img'
            src={(theme.palette.mode === 'dark' ? stars6White : stars6Black) as string}
            sx={{ height: '36px', width: '154px' }}
          />
          : <Typography sx={{ color: isPriceOutdated ? 'primary.light' : 'text.primary', fontSize: '42px', fontWeight: 500, height: 36, lineHeight: 1 }}>
            {allYouHaveAmount === undefined
              ? <Skeleton height={38} sx={{ transform: 'none' }} variant='text' width={223} />
              : <FormatPrice num={allYouHaveAmount || '0'} />
            }
          </Typography>
        }
        <Grid alignItems='center' item onClick={onHideClick} sx={{ cursor: 'pointer', position: 'absolute', pt: '3px', right: '31px' }}>
          {hideNumbers
            ? <Box component='img' src={show as string} sx={{ width: '34px' }} />
            : <Box component='img' src={hide as string} sx={{ width: '34px' }} />
          }
        </Grid>
      </Grid>
    </Grid>
  );
}
