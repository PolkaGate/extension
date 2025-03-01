// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { DataType, ItemInformation, ItemMetadata } from './types';

import NftManager from '../../../class/nftManager';
import { INITIAL_BACKOFF_TIME, IPFS_GATEWAYS, MAX_RETRY_ATTEMPTS } from './constants';

export const getContentUrl = (url: string | undefined) => {
  if (!url || url.length < 10) {
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

export const fetchWithRetry = async (url: string, attempt = 0): Promise<Response> => {
  try {
    const response = await fetch(url, { cache: 'force-cache' });

    if ([429, 500, 502, 503, 504].includes(response.status)) {
      throw new Error(`Retryable error with status ${response.status}`);
    }

    return response;
  } catch (error) {
    if (attempt < MAX_RETRY_ATTEMPTS - 1) {
      const backoffTime = (Math.floor(Math.random() * 10) + 1) * INITIAL_BACKOFF_TIME;

      // console.log(`Attempt ${attempt + 1} failed. Retrying in ${backoffTime}ms...`);
      await sleep(backoffTime);

      return fetchWithRetry(url, attempt + 1);
    }

    throw error;
  }
};

export const fetchData = async<T>(contentUrl: string | undefined, isMetadata = false): Promise<T | null > => {
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

const nftManager = new NftManager();

const getCollectionName = (collectionId: string | undefined, isNftCollection: boolean) => {
  const allNftItems = nftManager.getAll();

  if (allNftItems && collectionId) {
    const collection = Object.values(allNftItems).flat().find(({ collectionId: id, isCollection, isNft }) => isCollection && isNftCollection === isNft && id === String(collectionId));

    if (collection) {
      return collection.name;
    }
  }

  return undefined;
};

export const fetchCollectionName = async (address: string, api: ApiPromise | undefined, nftItemInfo: ItemInformation): Promise<void> => {
  if (!api) {
    return;
  }

  try {
    const queryPath = nftItemInfo.isNft ? 'nfts' : 'uniques';
    const metadataMethod = nftItemInfo.isNft ? 'collectionMetadataOf' : 'classMetadataOf';

    const response = await api.query[queryPath][metadataMethod](nftItemInfo.collectionId);
    const res = response.toPrimitive() as { data: string | undefined };

    if (!res?.data) {
      return;
    }

    const metadata = await fetchData<{ name?: string }>(res.data, true);

    if (metadata?.name) {
      nftManager.setItemDetail(
        address,
        nftItemInfo,
        { collectionName: metadata.name } as ItemMetadata
      );
    }
  } catch (error) {
    console.error(`Error fetching ${nftItemInfo.isNft ? 'NFT' : 'Unique'} collection name:`, error);
  }
};

export const fetchItemMetadata = async (address: string, item: ItemInformation) => {
  try {
    // if data in empty or null or undefined so the item detail gonna be null, means nothing to display
    if (!item.data) {
      nftManager.setItemDetail(address, item, null);

      return;
    }

    const itemMetadata = await fetchData<ItemMetadata>(item.data, true);

    if (!itemMetadata) {
      nftManager.setItemDetail(address, item, null);

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
      itemMetadata.image = itemMetadata.mediaUri;
    }

    const nftImageContent = itemMetadata.image
      ? await fetchData<DataType>(itemMetadata.image)
      : null;

    const nftAnimationContent = itemMetadata.animation_url
      ? await fetchData<DataType>(itemMetadata.animation_url)
      : null;

    const collectionName = item.isCollection
      ? undefined
      : getCollectionName(item.collectionId, item.isNft);

    const detail = {
      ...itemMetadata,
      animationContentType: nftAnimationContent?.contentType,
      animation_url: nftAnimationContent?.url ?? null,
      collectionName,
      image: nftImageContent?.url ?? null,
      imageContentType: nftImageContent?.contentType
    };

    nftManager.setItemDetail(address, item, detail);
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    nftManager.setItemDetail(address, item, null);
  }
};
