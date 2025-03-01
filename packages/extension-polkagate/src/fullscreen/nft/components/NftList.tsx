// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ItemsListProps } from '../utils/types';

import { Grid, Typography } from '@mui/material';
import React from 'react';

import Progress from '../../../components/Progress';
import useTranslation from '../../../hooks/useTranslation';
import { THUMBNAIL_HEIGHT } from '../utils/constants';
import Thumbnail from './Thumbnail';

const UNAVAILABLE_HEIGHT = 320;
const LIST_HEIGHT = innerHeight - UNAVAILABLE_HEIGHT;
const INLINE_PADDING = '40px';
const BLOCK_PADDING = '20px';
const MIN_LIST_HEIGHT = `calc(${THUMBNAIL_HEIGHT} + ${INLINE_PADDING})`;

function NftList({ apis, nfts }: ItemsListProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', boxShadow: '2px 3px 4px rgba(0, 0, 0, 0.2)', gap: '30px', height: 'fit-content', maxHeight: LIST_HEIGHT, minHeight: MIN_LIST_HEIGHT, overflowY: 'scroll', p: `${BLOCK_PADDING} ${INLINE_PADDING}` }}>
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
