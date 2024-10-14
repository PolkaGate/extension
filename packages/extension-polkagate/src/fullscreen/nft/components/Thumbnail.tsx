// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ItemProps } from '../utils/types';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { useTranslation } from '../../../components/translate';
import Details, { Detail } from './Details';
import ItemAvatar from './ItemAvatar';
import ItemSkeleton from './ItemSkeleton';

export default function Thumbnail ({ itemInformation, itemsDetail }: ItemProps): React.ReactElement {
  const { t } = useTranslation();

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const itemDetail = useMemo(() => itemsDetail[`${itemInformation?.collectionId} - ${itemInformation?.itemId}`], [itemInformation?.collectionId, itemInformation?.itemId, itemsDetail]);
  const displayNft = useMemo(() => (itemDetail || (itemDetail === null && itemInformation?.data)), [itemInformation?.data, itemDetail]);

  const openNftDetail = useCallback(() => setShowDetail(true), []);

  return (
    <>
      {itemInformation?.data && itemDetail === undefined
        ? <ItemSkeleton />
        : <Grid container item onClick={openNftDetail} sx={{ bgcolor: 'divider', border: '1px solid', borderColor: 'divider', borderRadius: '10px', boxShadow: '2px 3px 4px rgba(0, 0, 0, 0.2)', cursor: displayNft ? 'pointer' : 'default', height: '320px', width: '190px' }}>
          {!itemInformation?.data &&
            <Grid alignItems='center' container item justifyContent='center'>
              <Typography fontSize='16px' fontWeight={400}>
                {t('Without data')}!
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
                    isThumbnail
                    text={itemInformation.collectionId}
                    title={t('Collection ID')}
                  />
                }
                {itemInformation?.itemId &&
                  <Detail
                    isThumbnail
                    text={itemInformation?.itemId}
                    title={itemInformation.isNft ? t('NFT ID') : t('Unique ID')}
                  />
                }
              </Grid>
            </>
          }
        </Grid>
      }
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
