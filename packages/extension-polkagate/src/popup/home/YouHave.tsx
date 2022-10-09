// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Skeleton, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import useTranslation from '../../../../extension-ui/src/hooks/useTranslation';
import FormatPrice from '../../components/FormatPrice';

interface Props {
  allPrices: any | undefined;
}

export default function YouHave({ allPrices }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [price, setPrice] = useState<number>();

  useEffect(() => {
    if (!allPrices) {
      return;
    }

    let price = 0;

    Object.entries(allPrices).forEach((p) => {
      const t = Number(p[1].balances.freeBalance.add(p[1].balances.reservedBalance));

      price += (t * 10 ** -p[1].decimals) * p[1].price;
    });
    setPrice(price);
  }, [allPrices]);

  return (
    <Grid
      container
      pt='20px'
      textAlign='center'
    >
      <Grid
        item
        xs={12}
      >
        <Typography
          sx={{ fontSize: '18px', fontWeight: 300 }}
        >
          {t('You have')}
        </Typography>
      </Grid>
      <Grid
        container
        item
        justifyContent='center'
        xs={12}
      >
        <Typography
          sx={{ fontSize: '32px', fontWeight: 500, height: 36, lineHeight: 1 }}
        >
          {price === undefined
            ? <Skeleton
              height={38}
              sx={{ transform: 'none' }}
              variant='text'
              width={223}
            />
            : <FormatPrice num={price} />
          }
        </Typography>
      </Grid>
    </Grid>
  );
}
