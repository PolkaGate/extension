// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ItemProps } from '../utils/types';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { Progress } from '../../../components';
import { useTranslation } from '../../../components/translate';
import Details, { Detail } from './Details';
import ItemAvatar from './ItemAvatar';

export default function Item ({ itemInformation, itemsDetail }: ItemProps): React.ReactElement {
  const { t } = useTranslation();

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const itemDetail = useMemo(() => itemsDetail[`${itemInformation?.collectionId} - ${itemInformation?.itemId}`], [itemInformation?.collectionId, itemInformation?.itemId, itemsDetail]);
  const displayNft = useMemo(() => (itemDetail || (itemDetail === null && itemInformation?.data)), [itemInformation?.data, itemDetail]);

  const openNftDetail = useCallback(() => setShowDetail(true), []);

  return (
    <>
      <Grid container item onClick={openNftDetail} sx={{ bgcolor: 'divider', border: '1px solid', borderColor: 'divider', borderRadius: '10px', cursor: displayNft ? 'pointer' : 'default', height: '320px', width: '190px' }}>
        {itemInformation?.data && itemDetail === undefined &&
          <Progress
            size={30}
            type='circle'
          />
        }
        {!itemInformation?.data &&
          <Grid alignItems='center' container item justifyContent='center'>
            <Typography fontSize='16px' fontWeight={400}>
              {t('Don\'t have data')}!
            </Typography>
          </Grid>
        }
        {displayNft &&
          <>
            <ItemAvatar
              image={itemDetail?.image}
            />
            <Grid container item px='8px'>
              {itemDetail?.name &&
                <Typography fontSize='14px' fontWeight={400} sx={{ maxWidth: '190px', overflow: 'hidden', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                  {itemDetail.name}
                </Typography>
              }
              {itemInformation?.collectionId &&
                <Detail
                  text={itemInformation.collectionId}
                  title={t('Collection ID')}
                />
              }
              {itemInformation?.itemId &&
                <Detail
                  text={itemInformation?.itemId}
                  title={itemInformation.isNft ? t('NFT ID') : t('Unique ID')}
                />
              }
            </Grid>
          </>
        }
      </Grid>
      {showDetail && itemDetail && itemInformation &&
        <Details
          details={itemDetail}
          itemInformation={itemInformation}
          setShowDetail={setShowDetail}
          show={showDetail}
        />
      }
    </>
  );
}
