// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ItemInformation } from '.';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Progress } from '../../components';
import { useTranslation } from '../../components/translate';
import Details, { Detail } from './Details';
import ItemAvatar from './ItemAvatar';
import { useNftInfo } from './useNftInfo';

interface Props {
  itemInformation: ItemInformation | undefined;
}

interface Attribute { label: string; value: string }

export interface ItemMetadata {
  animation_url?: string;
  name?: string | undefined;
  description?: string | undefined;
  image?: string | null | undefined;
  attributes: Attribute[] | undefined;
  tags: string[] | undefined;
}

export default function Item ({ itemInformation }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { fetchData } = useNftInfo();

  const [nftSource, setNftSource] = useState<ItemMetadata | null | undefined>(undefined);
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const displayNft = useMemo(() => (nftSource || (nftSource === null && itemInformation?.data)), [itemInformation?.data, nftSource]);

  const fetchNFTMetadata = useCallback(async (contentUrl: string) => {
    try {
      const itemMetadata = await fetchData<ItemMetadata>(contentUrl);

      if (!itemMetadata) {
        setNftSource(null);

        return;
      }

      // in order to equal the unique metadata type and nft metadata type
      // in unique metadata there's "mediaUri" instead of "image"
      if ('mediaUri' in itemMetadata) {
        itemMetadata.image = itemMetadata.mediaUri as string;
        delete itemMetadata.mediaUri;
      }

      const nftImageContent = itemMetadata.image
        ? await fetchData<string>(itemMetadata.image, true)
        : null;

      setNftSource({
        ...itemMetadata,
        image: nftImageContent
      });
    } catch (error) {
      console.error('Error fetching NFT metadata:', error);
      setNftSource(null);
    }
  }, [fetchData]);

  useEffect(() => {
    if (itemInformation?.data) {
      fetchNFTMetadata(itemInformation.data).catch(console.error);
    }
  }, [fetchNFTMetadata, itemInformation?.data]);

  const openNftDetail = useCallback(() => setShowDetail(true), []);

  return (
    <>
      <Grid container item onClick={openNftDetail} sx={{ bgcolor: 'divider', border: '1px solid', borderColor: 'divider', borderRadius: '10px', cursor: displayNft ? 'pointer' : 'default', height: '320px', width: '190px' }}>
        {itemInformation?.data && nftSource === undefined &&
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
              image={nftSource?.image}
            />
            <Grid container item px='8px'>
              {nftSource?.name &&
                <Typography fontSize='14px' fontWeight={400} sx={{ maxWidth: '190px', overflow: 'hidden', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                  {nftSource.name}
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
      {showDetail && nftSource && itemInformation &&
        <Details
          details={nftSource}
          itemInformation={itemInformation}
          setShowDetail={setShowDetail}
          show={showDetail}
        />
      }
    </>
  );
}
