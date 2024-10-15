// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ItemInformation, ItemsDetail } from '../../nft/utils/types';

import { Avatar, AvatarGroup, Grid, Skeleton } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchItemMetadata } from '../../nft/utils/util';
import { openOrFocusTab } from './CommonTasks';

const MAX_NFT_TO_SHOW = 2; // we're gonna display up to 2 nfts if they were available!

interface NftGroupedProps {
  address: string | undefined;
  accountNft: ItemInformation[] | null | undefined;
}

function NftGrouped ({ accountNft, address }: NftGroupedProps): React.ReactElement {
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
    console.log('looooooop');

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
        <Skeleton height={30} variant='circular' width={30} />
      </Grid>
    );
  }

  return (
    <Grid alignItems='center' container item onClick={goToNft} sx={{ cursor: 'pointer', mx: '10px', width: 'fit-content' }}>
      <AvatarGroup sx={{ '& .MuiAvatarGroup-avatar': { border: '1px solid', borderColor: 'primary.main', fontSize: '12px', height: '30px', width: '30px' } }} total={accountNft?.length}>
        {nftsToDisplay?.map((image, index) => (
          <Avatar alt='NFT' key={index} src={image ?? undefined} style={{ border: '1px solid', borderColor: 'primary.main', height: '30px', width: '30px' }} />
        ))}
      </AvatarGroup>
    </Grid>
  );
}

export default React.memo(NftGrouped);
