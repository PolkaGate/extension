// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import { getFormattedAddress } from '../utils';
import { closeWebsockets, fastestEndpoint, getChainEndpoints } from './utils';

export const CHAIN_CONFIG = {
  KAH: { name: 'kusamaassethub', prefix: 2 },
  PAH: { name: 'polkadotassethub', prefix: 0 }
};

/**
 * Fetches NFT or unique items for a given chain and set of addresses
 * @param {Object} api - The API instance for interacting with the blockchain
 * @param {string[]} addresses - Array of addresses to fetch items for
 * @param {string} chain - The chain identifier (e.g., 'PAH' or 'KAH')
 * @param {boolean} isNft - Whether to fetch NFTs (true) or uniques (false)
 * @returns {Promise<Array>} Array of item information
 */
async function fetchItems (api, addresses, chain, isNft) {
  // Determine which query method to use based on item type
  const queryMethod = isNft ? api.query.nfts.item : api.query.uniques.asset;
  const entries = await queryMethod.entries();

  const myItems = entries
    .filter(([, itemInfo]) => {
      const info = itemInfo.toPrimitive();
      const owner = isNft ? [String(info.deposit.account), String(info.owner)] : [info?.owner?.toString()];

      return addresses.some((address) => owner.includes(address));
    })
    .map(([itemIds, itemInfo]) => {
      const [collectionId, itemId] = itemIds.toHuman().map((id) => id.replaceAll(',', ''));

      return {
        ids: { collectionId, itemId },
        itemInfo: itemInfo.toPrimitive()
      };
    });

  if (myItems.length === 0) {
    return [];
  }

  // Fetch metadata for all items
  const metadataPromises = myItems.map(({ ids }) =>
    isNft
      ? api.query.nfts.itemMetadataOf(ids.collectionId, ids.itemId)
      : api.query.uniques.instanceMetadataOf(ids.collectionId, ids.itemId)
  );
  const metadataRequests = await Promise.all(metadataPromises);
  const metadata = metadataRequests.map((metadata) => metadata.toPrimitive()?.data.toString());

  // Fetch prices for NFTs
  let prices = null;

  if (isNft) {
    const pricePromises = myItems.map(({ ids }) => api.query.nfts.itemPriceOf(ids.collectionId, ids.itemId));
    const priceRequests = await Promise.all(pricePromises);

    prices = priceRequests.map((price) => price.toPrimitive()?.[0]);
  }

  // Fetch creators for uniques
  let creators = null;

  if (!isNft) {
    const uniqueCollectionIds = [...new Set(myItems.map(({ ids }) => ids.collectionId))];
    const collectionsMetadata = await Promise.all(uniqueCollectionIds.map((id) => api.query.uniques.class(id)));

    creators = uniqueCollectionIds.reduce((acc, id, index) => {
      acc[id] = collectionsMetadata[index].toPrimitive()?.owner.toString();

      return acc;
    }, {});
  }

  return myItems.map(({ ids: { collectionId, itemId }, itemInfo }, index) => ({
    chain, // PAH, KAH
    collectionId,
    creator: isNft ? String(itemInfo.deposit.account) : creators?.[collectionId],
    data: metadata[index],
    isNft,
    itemId,
    owner: isNft ? String(itemInfo.owner) : itemInfo?.owner?.toString(),
    price: prices?.[index] ?? null
  }));
}

/**
 * Fetches both NFTs and uniques for a given chain
 * @param {Object} api - The API instance for interacting with the blockchain
 * @param {string[]} addresses - Array of addresses to fetch items for
 * @param {string} chain - The chain identifier (e.g., 'PAH' or 'KAH')
 * @returns {Promise<Array>} Combined array of NFTs and uniques
 */
async function fetchNFTsForChain (api, addresses, chain) {
  const [nfts, uniques] = await Promise.all([
    fetchItems(api, addresses, chain, true),
    fetchItems(api, addresses, chain, false)
  ]);

  return [...nfts, ...uniques];
}

/**
 * Fetches all NFTs and uniques across all configured chains
 * @param {string[]} addresses - Array of addresses to fetch items for
 * @returns {Promise<Array>} Combined array of all NFTs and uniques across all chains
 */
async function getNFTs (addresses) {
  const chains = Object.entries(CHAIN_CONFIG);

  // Initialize API connections for all chains
  const apiPromises = chains.map(async ([chain, { name, prefix }]) => {
    const formattedAddresses = addresses.map((address) => getFormattedAddress(address, undefined, prefix));
    const endpoints = getChainEndpoints(name, undefined);

    return fastestEndpoint(endpoints).then(({ api, connections }) => ({ api, chain, connections, formattedAddresses }));
  });

  const apis = await Promise.all(apiPromises);

  try {
    // Fetch NFTs and uniques for all chains in parallel
    const items = await Promise.all(apis.map(({ api, chain, formattedAddresses }) =>
      fetchNFTsForChain(api, formattedAddresses, chain)
    ));

    return items.flat();
  } finally {
    // Ensure all websocket connections are closed
    apis.forEach(({ connections }) => closeWebsockets(connections));
  }
}

onmessage = async (e) => {
  const { addresses } = e.data;

  if (!addresses) {
    console.warn('getPolkadotAssetHubNFT: No addresses to be fetched on PAH');

    return postMessage(undefined);
  }

  for (let tryCount = 1; tryCount <= 5; tryCount++) {
    try {
      const allItems = await getNFTs(addresses);

      postMessage(JSON.stringify(allItems));

      return;
    } catch (error) {
      console.error(`getNFTs: Error while fetching NFTs on polkadot asset hubs, ${5 - tryCount} times to retry`, error);

      if (tryCount === 5) {
        postMessage(undefined);
      }
    }
  }
};
