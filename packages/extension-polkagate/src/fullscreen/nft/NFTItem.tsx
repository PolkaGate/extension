// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { NFTInformation } from '.';

import { Avatar, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { NFTIcon, Progress } from '../../components';
import { useTranslation } from '../../components/translate';
import { ALT_NFT_BGCOLOR_DARK, ALT_NFT_BGCOLOR_LIGHT } from './constants';
import { useNftInfo } from './useNftInfo';
import NftDetails, { Detail } from './NftDetails';
import NftAvatar from './NftAvatar';

interface Props {
  nftInformation: NFTInformation | undefined;
}

interface Attribute { label: string; value: string }

export interface NFTMetadata {
  name?: string | undefined;
  description?: string | undefined;
  image?: string | null | undefined;
  attributes: Attribute[] | undefined;
  tags: string[] | undefined;
}

export default function NFTItem ({ nftInformation }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { fetchNftData } = useNftInfo();

  const [nftSource, setNftSource] = useState<NFTMetadata | null | undefined>(undefined);
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const displayNft = useMemo(() => (nftSource || (nftSource === null && nftInformation?.data)), [nftInformation?.data, nftSource]);

  const fetchNFTMetadata = useCallback(async (contentUrl: string) => {
    try {
      const nftMetadata = await fetchNftData<NFTMetadata>(contentUrl);

      if (!nftMetadata) {
        setNftSource(null);

        return;
      }

      const nftImageContent = nftMetadata.image
        ? await fetchNftData<string>(nftMetadata.image, true)
        : undefined;

      setNftSource({
        ...nftMetadata,
        image: nftImageContent
      });
    } catch (error) {
      console.error('Error fetching NFT metadata:', error);
      setNftSource(null);
    }
  }, [fetchNftData]);

  useEffect(() => {
    if (nftInformation?.data) {
      fetchNFTMetadata(nftInformation.data).catch(console.error);
    }
  }, [fetchNFTMetadata, nftInformation?.data]);

  const openNftDetail = useCallback(() => setShowDetail(true), []);

  return (
    <>
      <Grid container item onClick={openNftDetail} sx={{ bgcolor: 'divider', border: '1px solid', borderColor: 'divider', borderRadius: '10px', cursor: displayNft ? 'pointer' : 'default', height: '320px', width: '190px' }}>
        {nftInformation?.data && nftSource === undefined &&
          <Progress
            size={30}
            type='circle'
          />
        }
        {!nftInformation?.data &&
          <Grid alignItems='center' container item justifyContent='center'>
            <Typography fontSize='16px' fontWeight={400}>
              {t('Don\'t have data')}!
            </Typography>
          </Grid>
        }
        {displayNft &&
          <>
            <NftAvatar
              image={nftSource?.image}
            />
            <Grid container item px='8px'>
              {nftSource?.name &&
                <Typography fontSize='14px' fontWeight={400} sx={{ maxWidth: '100%', textAlign: 'center', textOverflow: 'ellipsis', width: '100%' }}>
                  {nftSource.name}
                </Typography>
              }
              {nftInformation?.collectionId &&
                <Detail
                  text={nftInformation.collectionId}
                  title={t('Collection ID')}
                />
              }
              {nftInformation?.nftId &&
                <Detail
                  text={nftInformation?.nftId}
                  title={t('NFT ID')}
                />
              }
            </Grid>
          </>
        }
      </Grid>
      {showDetail && nftSource && nftInformation &&
        <NftDetails
          details={nftSource}
          nftInformation={nftInformation}
          setShowDetail={setShowDetail}
          show={showDetail}
        />
      }
    </>
  );
}
