// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ThumbnailProps } from '../utils/types';

import CollectionsIcon from '@mui/icons-material/Collections';
import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { useTranslation } from '../../../components/translate';
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '../utils/constants';
import { fetchCollectionName } from '../utils/util';
import Details from './Details';
import InfoRow from './InfoRow';
import ItemAvatar from './ItemAvatar';
import ItemSkeleton from './ItemSkeleton';

export default function Thumbnail({ api, itemInformation }: ThumbnailProps): React.ReactElement {
  const { t } = useTranslation();
  const { address } = useParams<{ address: string }>();

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const loading = useMemo(() => Boolean(itemInformation?.data && !itemInformation.description && !itemInformation.name), [itemInformation?.data, itemInformation?.description, itemInformation?.name]);

  useEffect(() => {
    itemInformation && !itemInformation?.isCollection && !itemInformation?.collectionName && fetchCollectionName(address, api, itemInformation).catch(console.error);
  }, [address, api, itemInformation]);

  const openNftDetail = useCallback(() => setShowDetail(true), []);

  return (
    <>
      {loading
        ? <ItemSkeleton />
        : <Grid container item onClick={openNftDetail} sx={{ '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' }, bgcolor: 'divider', border: '1px solid', borderColor: 'divider', borderRadius: '10px', boxShadow: '2px 3px 4px rgba(0, 0, 0, 0.2)', cursor: 'pointer', height: THUMBNAIL_HEIGHT, position: 'relative', transition: '0.3s', width: THUMBNAIL_WIDTH }}>
          <ItemAvatar
            image={itemInformation?.image ?? null}
          />
          <Grid container item px='8px'>
            {itemInformation?.name &&
              <Typography fontSize='14px' fontWeight={400} sx={{ maxWidth: '174px', overflow: 'hidden', py: '15px', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                {itemInformation.name}
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
                <Typography fontSize='14px' fontWeight={400} sx={{ color: 'primary.light', maxWidth: '174px', overflow: 'hidden', py: '5px', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
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
        </Grid>
      }
      {showDetail && itemInformation &&
        <Details
          api={api}
          itemInformation={itemInformation}
          setShowDetail={setShowDetail}
          show={showDetail}
        />
      }
    </>
  );
}
