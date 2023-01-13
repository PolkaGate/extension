// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Skeleton, Typography } from '@mui/material';
import React, { useContext, useMemo } from 'react';

import { BN } from '@polkadot/util';

import { hide } from '../../assets/icons';
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

        if (bal && price) {//} && bal.token === prices.token) {
          const total = new BN(balances[chainName].balances.freeBalance)
            .add(new BN(balances[chainName].balances.reservedBalance))
            .add(new BN(balances[chainName].balances.pooledBalance));

          value += price * (Number(total) * 10 ** -bal.decimal);
        }
      });
    });

    return value;
  }, [accounts]);

  return (
    <Grid container pt='15px' textAlign='center'>
      <Grid item xs={12}>
        <Typography sx={{ fontSize: '18px' }}>
          {t('You have')}
        </Typography>
      </Grid>
      <Grid container item justifyContent='center' xs={12}>
        <Typography sx={{ fontSize: '42px', fontWeight: 500, height: 36, lineHeight: 1 }}>
          {allYouHaveAmount === undefined
            ? <Skeleton height={38} sx={{ transform: 'none' }} variant='text' width={223} />
            : <FormatPrice num={allYouHaveAmount} />
          }
        </Typography>
        <Grid container direction='column' justifyContent='center' alignItems='center' item sx={{ pt: '3px', border: 1, borderColor: 'secondary.light', borderRadius: '15%', right: '18px', position: 'absolute', height: '34px', width: '34px', cursor: 'pointer' }}>
          <Box
            component='img'
            src={hide}
            sx={{ width: '26px' }}
          />
          <Typography sx={{ fontSize: '12px', color: 'secondary.light', fontWeight: 500 }}>
            {t('Hide')}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}
