// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { ApiPromise } from '@polkadot/api';
// @ts-ignore
import type { PalletNftsItemDetails, PalletNftsItemMetadata, PalletUniquesItemDetails, PalletUniquesItemMetadata } from '@polkadot/types/lookup';
import type { ItemInformation } from './types';

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

    const nftInfos = myNFTs.map(({ ids: { collectionId, nftId } }, index) => ({
      collectionId,
      data: nftsMetadata[index],
      isNft: true,
      itemId: nftId
    }));

    setMyNFTs(nftInfos);
  } catch (error) {
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

    const myUniquesInfos = myUniques.map(({ ids: { collectionId, uniqueId } }, index) => ({
      collectionId,
      data: uniquesMetadata[index],
      isNft: false,
      itemId: uniqueId
    }));

    setMyUniques(myUniquesInfos);
  } catch (error) {
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
