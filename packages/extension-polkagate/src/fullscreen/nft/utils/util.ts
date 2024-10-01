// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { ApiPromise } from '@polkadot/api';
// @ts-ignore
import type { PalletNftsItemDetails, PalletNftsItemMetadata, PalletUniquesCollectionDetails, PalletUniquesItemDetails, PalletUniquesItemMetadata } from '@polkadot/types/lookup';
import type { DataType, ItemInformation, ItemMetadata, ItemsDetail } from './types';

import { INITIAL_BACKOFF_TIME, IPFS_GATEWAYS, MAX_BACKOFF_TIME, MAX_RETRY_ATTEMPTS } from './constants';

export const fetchNFTs = async (api: ApiPromise, formatted: string, setMyNFTs: React.Dispatch<React.SetStateAction<ItemInformation[] | undefined>>) => {
  try {
    const nftEntries = await api.query['nfts']['item'].entries();

    const myNFTs = nftEntries
      .filter(([_ntfId, nftInfo]) => {
        const info = nftInfo.toPrimitive() as unknown as PalletNftsItemDetails;

        return [String(info.deposit.account), String(info.owner)].includes(formatted);
      })
      .map(([ntfId, nftInfo]) => {
        const sanitizedId = (ntfId?.toHuman() as string[]).map((id) => id.replaceAll(',', ''));

        return {
          ids: {
            collectionId: sanitizedId[0],
            nftId: sanitizedId[1]
          },
          nftInfo: nftInfo.toPrimitive() as unknown as PalletNftsItemDetails
        };
      });

    const nftMetadataPromises = myNFTs.map(({ ids }) =>
      api.query['nfts']['itemMetadataOf'](ids.collectionId, ids.nftId)
    );
    const nftsMetadataRequests = await Promise.all(nftMetadataPromises);
    const nftsMetadata = nftsMetadataRequests.map((metadata) => (metadata.toPrimitive() as unknown as PalletNftsItemMetadata)?.data.toString());

    const nftInfos = myNFTs.map(({ ids: { collectionId, nftId }, nftInfo: { deposit: { account }, owner } }, index) => ({
      collectionId,
      data: nftsMetadata[index],
      isCreator: String(account) === formatted,
      isNft: true,
      isOwner: String(owner) === formatted,
      itemId: nftId
    }));

    setMyNFTs(nftInfos);
  } catch (error) {
    setMyNFTs([]);
    console.error('Error fetching NFTs:', error);
  }
};

export const fetchUniques = async (api: ApiPromise, formatted: string, setMyUniques: React.Dispatch<React.SetStateAction<ItemInformation[] | undefined>>) => {
  try {
    const uniqueEntries = await api.query['uniques']['asset'].entries();
    const myUniques = uniqueEntries
      .filter(([_uniquesId, uniquesInfo]) => {
        const info = uniquesInfo?.toPrimitive() as unknown as PalletUniquesItemDetails;

        return info?.owner?.toString() === formatted;
      })
      .map(([uniquesId, uniquesInfo]) => {
        const sanitizedId = (uniquesId?.toHuman() as string[]).map((id) => id.replaceAll(',', ''));

        return {
          ids: {
            collectionId: sanitizedId[0],
            uniqueId: sanitizedId[1]
          },
          uniqueInfo: uniquesInfo.toPrimitive() as unknown as PalletUniquesItemDetails
        };
      });

    const uniqueMetadataPromises = myUniques.map(({ ids }) =>
      api.query['uniques']['instanceMetadataOf'](ids.collectionId, ids.uniqueId)
    );
    const uniquesMetadataRequests = await Promise.all(uniqueMetadataPromises);
    const uniquesMetadata = uniquesMetadataRequests.map((metadata) => (metadata.toPrimitive() as unknown as PalletUniquesItemMetadata)?.data.toString());

    const collectionIds = myUniques.map(({ ids: { collectionId } }) => collectionId);
    const setOfCollectionIds = [...new Set(collectionIds)];
    const collectionsMetadata = setOfCollectionIds.map((id) => api.query['uniques']['class'](id));
    const collectionMetadataRequests = await Promise.all(collectionsMetadata);
    const collectionMetadata = collectionMetadataRequests.map((metadata) => (metadata.toPrimitive() as unknown as PalletUniquesCollectionDetails)?.owner.toString());
    const collectionOwners = setOfCollectionIds.map((id, index) => ({ creator: collectionMetadata[index], id }));

    const myUniquesInfos = myUniques.map(({ ids: { collectionId, uniqueId } }, index) => {
      const creator = collectionOwners.find(({ id }) => id === collectionId)?.creator;

      return ({
        collectionId,
        data: uniquesMetadata[index],
        isCreator: creator === formatted,
        isNft: false,
        isOwner: true,
        itemId: uniqueId
      });
    });

    setMyUniques(myUniquesInfos);
  } catch (error) {
    setMyUniques([]);
    console.error('Error fetching uniques:', error);
  }
};

export const getContentUrl = (url: string | undefined) => {
  if (!url) {
    return { isIPFS: false, sanitizedUrl: undefined };
  }

  if (url.startsWith('https')) {
    return { isIPFS: false, sanitizedUrl: url };
  }

  let cid = url.replace(/^ipfs:\/\/ipfs\/|^ipfs:\/\/|^ipfs\//, '');

  cid = cid.replace(/^\/+/, '');

  return { isIPFS: !cid.startsWith('http'), sanitizedUrl: cid };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, attempt = 0): Promise<Response> => {
  try {
    const response = await fetch(url);

    if (response.status === 429) { // Too Many Requests
      throw new Error('Rate limited');
    }

    return response;
  } catch (error) {
    if (attempt < MAX_RETRY_ATTEMPTS - 1) {
      const backoffTime = Math.min(INITIAL_BACKOFF_TIME * Math.pow(2, attempt), MAX_BACKOFF_TIME);

      console.log(`Attempt ${attempt + 1} failed. Retrying in ${backoffTime}ms...`);
      await sleep(backoffTime);

      return fetchWithRetry(url, attempt + 1);
    }

    throw error;
  }
};

export const fetchData = async <T>(contentUrl: string | undefined, isMetadata = false): Promise<T | null> => {
  if (!contentUrl) {
    return null;
  }

  const { isIPFS, sanitizedUrl } = getContentUrl(contentUrl);

  if (!sanitizedUrl) {
    return null;
  }

  const fetchAndProcess = async (url: string) => {
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (isMetadata) {
      return {
        ...(await response.json() as T),
        metadataLink: url
      } as T;
    } else {
      const contentType = response.headers.get('content-type');

      return {
        contentType,
        url: response.url
      } as T;
    }
  };

  if (!isIPFS) {
    return fetchAndProcess(sanitizedUrl);
  }

  for (const gateway of IPFS_GATEWAYS) {
    try {
      return await fetchAndProcess(gateway + sanitizedUrl);
    } catch (error) {
      console.error(`Failed to fetch from ${gateway}:`, error);
    }
  }

  console.error('Failed to fetch NFT/Unique data from all gateways');

  return null;
};

export const fetchItemMetadata = async (item: ItemInformation, setItemsDetail: (value: React.SetStateAction<ItemsDetail>) => void) => {
  try {
    // if data in empty or null or undefined so the item detail gonna be null, means nothing to display
    if (!item.data) {
      setItemsDetail((perv) => ({
        ...perv,
        [`${item.collectionId} - ${item.itemId}`]: null
      }));

      return;
    }

    const itemMetadata = await fetchData<ItemMetadata>(item.data, true);

    if (!itemMetadata) {
      setItemsDetail((perv) => ({
        ...perv,
        [`${item.collectionId} - ${item.itemId}`]: null
      }));

      return;
    }

    /**
     * Handles the difference between NFT and Unique metadata formats:
     * In Unique metadata, the image URL is stored in the 'mediaUri' property.
     * In standard NFT metadata, the image URL is stored in the 'image' property.
     * Then it converts 'mediaUri' to 'image' if present, ensuring a consistent
     * interface for the rest of the application to work with.
     */
    if (!('image' in itemMetadata) && 'mediaUri' in itemMetadata) {
      itemMetadata.image = itemMetadata.mediaUri as string;
      delete itemMetadata.mediaUri;
    }

    const nftImageContent = itemMetadata.image
      ? await fetchData<DataType>(itemMetadata.image)
      : null;

    const detail = {
      ...itemMetadata,
      contentType: nftImageContent?.contentType,
      image: nftImageContent?.url
    };

    setItemsDetail((perv) => ({
      ...perv,
      [`${item.collectionId} - ${item.itemId}`]: detail
    }));
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    setItemsDetail((perv) => ({
      ...perv,
      [`${item.collectionId} - ${item.itemId}`]: null
    }));
  }
};
