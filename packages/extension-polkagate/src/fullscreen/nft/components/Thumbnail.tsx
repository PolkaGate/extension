// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ThumbnailProps } from '../utils/types';

import CollectionsIcon from '@mui/icons-material/Collections';
import { Box, Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { useTranslation } from '../../../components/translate';
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '../utils/constants';
import Details, { InfoRow } from './Details';
import ItemAvatar from './ItemAvatar';
import ItemSkeleton from './ItemSkeleton';

export default function Thumbnail ({ api, itemInformation, itemsDetail }: ThumbnailProps): React.ReactElement {
  const { t } = useTranslation();

  const [showDetail, setShowDetail] = useState<boolean>(false);
  
  const itemDetail = useMemo(() => itemsDetail[`${itemInformation?.collectionId} - ${itemInformation?.itemId}`], [itemInformation?.collectionId, itemInformation?.itemId, itemsDetail]);
  const displayNft = useMemo(() => (itemDetail || (itemDetail === null && itemInformation?.data)), [itemInformation?.data, itemDetail]);
  
  console.log('itemDetail && itemInformation:::', itemDetail, itemInformation);

  const openNftDetail = useCallback(() => setShowDetail(true), []);

  return (
    <>
      {itemInformation?.data && itemDetail === undefined
        ? <ItemSkeleton />
        : <Grid container item onClick={openNftDetail} sx={{ bgcolor: 'divider', border: '1px solid', borderColor: 'divider', borderRadius: '10px', boxShadow: '2px 3px 4px rgba(0, 0, 0, 0.2)', cursor: displayNft ? 'pointer' : 'default', height: THUMBNAIL_HEIGHT, width: THUMBNAIL_WIDTH }}>
          {itemInformation?.data === null &&
            <Grid alignItems='center' container item justifyContent='center'>
              <Typography fontSize='16px' fontWeight={400}>
                {t('Without data')}!
              </Typography>
            </Grid>
          }
          {displayNft &&
            <Box
              sx={{
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)'
                },
                borderRadius: '5px',
                position: 'relative',
                transition: '0.3s',
                width: 'max-content'
              }}
            >
              <ItemAvatar
                image={itemDetail?.image ?? null}
              />
              <Grid container item px='8px'>
                {itemDetail?.name &&
                  <Typography fontSize='14px' fontWeight={400} sx={{ maxWidth: '174px', overflow: 'hidden', py: '15px', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                    {itemDetail.name}
                  </Typography>
                }
                {itemInformation?.items !== undefined &&
                  <InfoRow
                    isThumbnail
                    text={itemInformation.items.toString()}
                    title={t('Items')}
                  />
                }
                {!itemInformation?.isCollection &&
                <InfoRow
                  api={api}
                  divider={false}
                  price={itemInformation?.price}
                  title={t('Price')}
                />
                }
                {itemInformation?.chainName &&
                  <>
                    <Divider sx={{ bgcolor: 'divider', height: '1px', m: '8px auto 0', width: '100%' }} />
                    <Typography fontSize='14px' fontWeight={400} sx={{ maxWidth: '174px', overflow: 'hidden', pt: '10px', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                      {itemInformation.chainName}
                    </Typography>
                  </>
                }
              </Grid>
              {itemInformation?.isCollection &&
                <CollectionsIcon
                  sx={{
                    bgcolor: 'support.main',
                    borderRadius: '5px',
                    boxShadow: '0 0 1px rgb(0, 0, 0)',
                    color: 'secondary.light',
                    p: '2px',
                    position: 'absolute',
                    right: '10px',
                    top: '10px'
                  }}
                />
              }
            </Box>
          }
        </Grid>
      }
      {showDetail && itemInformation &&
        <Details
          api={api}
          details={itemDetail ?? null}
          itemInformation={itemInformation}
          setShowDetail={setShowDetail}
          show={showDetail}
        />
      }
    </>
  );
}
