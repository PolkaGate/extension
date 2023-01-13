// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import { BN } from '@polkadot/util';

import { hide, stars6Black, stars6White } from '../../assets/icons';
import { AccountContext } from '../../components';
import FormatPrice from '../../components/FormatPrice';
import useTranslation from '../../hooks/useTranslation';
import { Prices, SavedBalances } from '../../util/types';

interface Props {
  hideNumbers: boolean;
  setHideNumbers: React.Dispatch<React.SetStateAction<boolean>>
}

export default function YouHave({ hideNumbers, setHideNumbers }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const theme = useTheme();

  const allYouHaveAmount = useMemo((): number | undefined => {
    if (!accounts) {
      return undefined;
    }

    let value = 0;

    accounts.forEach((acc) => {
      if (!acc?.balances) {
        return;
      }

      const balances = JSON.parse(acc.balances) as SavedBalances;

      Object.keys(balances).forEach((chainName) => {
        const localSavedPrices = window.localStorage.getItem('prices');

        const parsedPrices = localSavedPrices && JSON.parse(localSavedPrices) as Prices;
        const price = (parsedPrices?.prices[chainName] || parsedPrices?.prices[chainName.toLocaleLowerCase()])?.usd;

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
  }, [accounts]);

  const onHideClick = useCallback(() => {
    setHideNumbers(!hideNumbers);
    window.localStorage.setItem('hide_numbers', hideNumbers ? 'false' : 'true');
  }, [hideNumbers, setHideNumbers]);

  useEffect(() => {
    const isHide = window.localStorage.getItem('hide_numbers');

    isHide === 'true' ? setHideNumbers(true) : setHideNumbers(false);
  }, [setHideNumbers]);

  return (
    <Grid container pt='15px' textAlign='center'>
      <Grid item xs={12}>
        <Typography sx={{ fontSize: '18px' }}>
          {t('You have')}
        </Typography>
      </Grid>
      <Grid container item justifyContent='center' xs={12}>
        {hideNumbers
          ? <Box
            component='img'
            src={(theme.palette.mode === 'dark' ? stars6White : stars6Black) as string}
            sx={{ height: '36px', width: '154px' }}
          />
          : <Typography sx={{ fontSize: '42px', fontWeight: 500, height: 36, lineHeight: 1 }}>
            {allYouHaveAmount === undefined
              ? <Skeleton height={38} sx={{ transform: 'none' }} variant='text' width={223} />
              : <FormatPrice num={allYouHaveAmount} />
            }
          </Typography>
        }
        <Grid alignItems='center' container direction='column' item justifyContent='center' onClick={onHideClick}
          sx={{
            border: 0.5,
            borderColor: 'secondary.light',
            borderRadius: '15%',
            cursor: 'pointer',
            height: '34px',
            position: 'absolute',
            pt: '3px',
            right: '31px',
            userSelect: 'none',
            width: '34px'
          }}
        >
          {hideNumbers
            ? <Typography sx={{ color: 'secondary.light', fontSize: '12px', fontWeight: 500, lineHeight: '13px' }}>
              {t('Show No.')}
            </Typography>
            : <>
              <Box
                component='img'
                src={hide as string}
                sx={{ width: '26px' }}
              />
              <Typography sx={{ color: 'secondary.light', fontSize: '12px', fontWeight: 500 }}>
                {t('Hide')}
              </Typography>
            </>
          }
        </Grid>
      </Grid>
    </Grid>
  );
}
