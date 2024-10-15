// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ItemInformation, ItemsDetail } from '../../nft/utils/types';

import { Avatar, AvatarGroup, Grid, useTheme } from '@mui/material';
//@ts-ignore
import { Wordpress } from 'better-react-spinkit';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Infotip2 from '../../../components/Infotip2';
import { fetchItemMetadata } from '../../nft/utils/util';
import { openOrFocusTab } from './CommonTasks';

const MAX_NFT_TO_SHOW = 2; // we're gonna display up to 2 nfts if they were available!

interface NftGroupedProps {
  address: string | undefined;
  accountNft: ItemInformation[] | null | undefined;
}

function NftGrouped ({ accountNft, address }: NftGroupedProps): React.ReactElement {
  const theme = useTheme();

  const [itemsDetails, setItemsDetails] = useState<ItemsDetail>({});
  const [isLoading, setIsLoading] = React.useState(true);

  const itemsToShow = useMemo(() => accountNft?.slice(0, MAX_NFT_TO_SHOW), [accountNft]);

  const nftsToDisplay = useMemo(() => {
    return itemsToShow?.map((item) =>
      itemsDetails[`${item?.collectionId} - ${item?.itemId}`]?.image
    ).filter(Boolean);
  }, [itemsDetails, itemsToShow]);

  const fetchMetadata = useCallback(async () => {
    if (!itemsToShow || itemsToShow?.length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      await Promise.all(
        itemsToShow.map((item) => fetchItemMetadata(item, setItemsDetails))
      );
    } catch (error) {
      console.error('Error fetching NFT metadata:', error);
    } finally {
      setIsLoading(false);
    }
  }, [itemsToShow]);

  useEffect(() => {
    if (!itemsToShow || itemsToShow?.length === 0) {
      return;
    }

    fetchMetadata().catch(console.error);
  }, [fetchMetadata, itemsToShow]);

  const goToNft = useCallback(() => {
    address && openOrFocusTab(`/nft/${address}`);
  }, [address]);

  if (!accountNft || accountNft.length === 0) {
    return <></>;
  }

  if (isLoading) {
    return (
      <Grid alignItems='center' container item px='10px' width='fit-content'>
        <Wordpress
          color={theme.palette.text.disabled}
          size={31}
          timingFunction='linear'
        />
      </Grid>
    );
  }

  return (
    <Grid alignItems='center' container item onClick={goToNft} sx={{ cursor: 'pointer', mx: '10px', width: 'fit-content' }}>
      <Infotip2 text='NFTs'>
        <AvatarGroup
          sx={{
            '& .MuiAvatarGroup-avatar': {
              border: '1px solid',
              borderColor: 'divider',
              fontSize: '12px',
              height: '30px',
              width: '30px'
            },
            '& .MuiAvatarGroup-avatar:nth-last-of-type(3)': {
              color: 'text.primary'
            }
          }}
          total={accountNft?.length}
        >
          {nftsToDisplay?.map((image, index) => (
            <Avatar alt='NFT' key={index} src={image ?? undefined} style={{ height: '30px', width: '30px' }} />
          ))}
        </AvatarGroup>
      </Infotip2>
    </Grid>
  );
}

export default React.memo(NftGrouped);
