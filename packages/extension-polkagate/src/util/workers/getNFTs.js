// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import { getFormattedAddress } from '../utils';
import { closeWebsockets, fastestEndpoint, getChainEndpoints } from './utils';

export const SUPPORTED_NFT_CHAINS = {
  'Kusama Asset Hub': { name: 'kusamaassethub', prefix: 2 },
  'Polkadot Asset Hub': { name: 'polkadotassethub', prefix: 0 }
};

/**
 * Fetches NFT or unique items for a given chain and set of addresses
 * @param {Object} api - The API instance for interacting with the blockchain
 * @param {string[]} addresses - Array of addresses to fetch items for
 * @param {string} chainName - The chain identifier
 * @param {boolean} isNft - Whether to fetch NFTs (true) or uniques (false)
 * @returns {Promise<Array>} Array of item information
 */
async function fetchItems (api, addresses, chainName, isNft) {
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
  const metadata = metadataRequests.map((metadata) => {
    const data = metadata.toPrimitive()?.data;

    return data ? data.toString() : null;
  });

  // Fetch prices for NFTs
  let prices = null;

  if (isNft) {
    const pricePromises = myItems.map(({ ids }) => api.query.nfts.itemPriceOf(ids.collectionId, ids.itemId));
    const priceRequests = await Promise.all(pricePromises);

    prices = priceRequests.map((price) => {
      const priceData = price.toPrimitive();

      return priceData ? priceData[0] : null;
    });
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
    chainName,
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
 * @param {string} chainName - The chain identifier
 * @returns {Promise<Array>} Combined array of NFTs and uniques
 */
async function fetchNFTsForChain (api, addresses, chainName) {
  const [nfts, uniques] = await Promise.all([
    fetchItems(api, addresses, chainName, true),
    fetchItems(api, addresses, chainName, false)
  ]);

  return [...nfts, ...uniques];
}

/**
 * Fetches all NFTs and uniques across all configured chains
 * @param {string[]} addresses - Array of addresses to fetch items for
 * @returns {Promise<Array>} Combined array of all NFTs and uniques across all chains
 */
async function getNFTs (addresses) {
  const chainNames = Object.entries(SUPPORTED_NFT_CHAINS);

  // Initialize API connections for all chainNames
  const apiPromises = chainNames.map(async ([chainName, { name, prefix }]) => {
    const formattedAddresses = addresses.map((address) => getFormattedAddress(address, undefined, prefix));
    const endpoints = getChainEndpoints(name, undefined);

    const { api, connections } = await fastestEndpoint(endpoints);

    return ({ api, chainName, connections, formattedAddresses, originalAddresses: addresses });
  });

  const apis = await Promise.all(apiPromises);

  try {
    // Fetch NFTs and uniques for all chains in parallel
    const itemsByChain = await Promise.all(apis.map(({ api, chainName, formattedAddresses, originalAddresses }) =>
      fetchNFTsForChain(api, formattedAddresses, chainName, originalAddresses)
    ));

    // Organize items by address
    const itemsByAddress = addresses.reduce((acc, address) => {
      acc[address] = [];

      return acc;
    }, {});

    itemsByChain.flat().forEach((item) => {
      const matchingAddress = addresses.find((addr) =>
        [item.owner, item.creator].includes(getFormattedAddress(addr, undefined, SUPPORTED_NFT_CHAINS[item.chainName].prefix))
      );

      if (matchingAddress) {
        itemsByAddress[matchingAddress].push(item);
      }
    });

    return itemsByAddress;
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
      } else {
        // Wait for a delay before retrying (e.g., exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, tryCount * 1000));
      }
    }
  }
};
