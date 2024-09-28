// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ItemsListProps } from '../utils/types';

import { Grid, Typography } from '@mui/material';
import React from 'react';

import Progress from '../../../components/Progress';
import useTranslation from '../../../hooks/useTranslation';
import Item from './Item';

export default function ItemsList ({ items, itemsDetail }: ItemsListProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Grid container item sx={{ bgcolor: 'background.paper', gap: '30px', height: '450px', maxHeight: '550px', overflowY: 'scroll', p: '20px 40px' }}>
      {items === undefined &&
        <Grid alignItems='center' container item justifyContent='center'>
          <Progress
            gridSize={120}
            title={t('Looking for NFTs/Uniques!')}
            type='grid'
          />
        </Grid>
      }
      {items?.map((nftInfo) => (
        <Item
          itemInformation={nftInfo}
          itemsDetail={itemsDetail}
          key={nftInfo.itemId}
        />
      ))
      }
      {items === null &&
        <Grid alignItems='center' container item justifyContent='center'>
          <Typography fontSize='16px' fontWeight={400}>
            {t('You do not own any NFTs/Uniques')}!
          </Typography>
        </Grid>
      }
      {items && items.length === 0 &&
        <Grid alignItems='center' container item justifyContent='center'>
          <Typography fontSize='16px' fontWeight={400}>
            {t('No items match your current filter criteria')}!
          </Typography>
        </Grid>
      }
    </Grid>
  );
}
