// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Skeleton, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import useTranslation from '../../../../extension-ui/src/hooks/useTranslation';
import FormatPrice from '../../components/FormatPrice';

interface Props {
  className?: string;
  totalPrice: any | undefined;
}

export default function YouHave({ totalPrice, className }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [price, setPrice] = useState<number>();

  useEffect(() => {
    if (!totalPrice) {
      return;
    }

    let price = 0;

    console.log(totalPrice)
    // .forEach((p) => {
    //   // const t = Number(p.balances.freeBalance.add(p.balances.reservedBalance));

    //   // price += (t * 10 ** -p.decimals) * p.price;

    //   console.log('pppp:',p)
    // });
    setPrice(price);
  }, [totalPrice]);

  return (
    <Grid
      container
      textAlign='center'
      pt='20px'
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
        item
        xs={12}
      >
        <Typography
          sx={{ fontSize: '32px', fontWeight: 500, lineHeight: 1 }}
        >
{/* 
          {!totalPrice
            ? <Skeleton height={22} sx={{ transform: 'none', my: '2.5px' }} variant='text' width={90} />
            : <FormatPrice num={price} />
          } */}
        </Typography>
      </Grid>
    </Grid>
  );
}
