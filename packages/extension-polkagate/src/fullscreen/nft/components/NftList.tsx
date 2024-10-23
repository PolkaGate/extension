// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ItemsListProps } from '../utils/types';

import { Grid, Typography } from '@mui/material';
import React from 'react';

import Progress from '../../../components/Progress';
import useTranslation from '../../../hooks/useTranslation';
import Thumbnail from './Thumbnail';

const UNAVAILABLE_HEIGHT = 320;
const LIST_HEIGHT = innerHeight - UNAVAILABLE_HEIGHT;

function NftList ({ apis, itemsDetail, nfts }: ItemsListProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', boxShadow: '2px 3px 4px rgba(0, 0, 0, 0.2)', gap: '30px', height: LIST_HEIGHT, maxHeight: LIST_HEIGHT, overflowY: 'scroll', p: '20px 40px' }}>
      {!nfts &&
        <Grid alignItems='center' container item justifyContent='center'>
          {nfts === undefined
            ? <Progress
              gridSize={120}
              title={t('Looking for NFTs/Uniques!')}
              type='grid'
            />
            : <Typography fontSize='16px' fontWeight={400}>
              {t('You do not own any NFTs/Uniques')}!
            </Typography>
          }
        </Grid>
      }
      {nfts?.map((nftInfo, index) => (
        <Thumbnail
          api={apis[nftInfo.chainName]}
          itemInformation={nftInfo}
          itemsDetail={itemsDetail}
          key={index}
        />
      ))
      }
      {nfts && nfts.length === 0 &&
        <Grid alignItems='center' container item justifyContent='center'>
          <Typography fontSize='16px' fontWeight={400}>
            {t('Nothing to Show')}!
          </Typography>
        </Grid>
      }
    </Grid>
  );
}

export default React.memo(NftList);
