// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import { SUPPORTED_NFT_CHAINS } from '../../fullscreen/nft/utils/constants';
import { getFormattedAddress } from '../utils';
import { closeWebsockets, fastestEndpoint, getChainEndpoints } from './utils';

/**
 * Fetches NFT or unique collections for a given chain and set of addresses
 * @param {ApiPromise} api - The API instance for interacting with the blockchain
 * @param {string[]} addresses - Array of addresses to fetch items for
 * @param {string} chainName - The chain identifier
 * @param {boolean} isNft - Whether to fetch NFT collections (true) or unique collections (false)
 * @returns {Promise<ItemInformation[]>} Array of collection information
 */
async function fetchCollections(api, addresses, chainName, isNft) {
  // Determine which query method to use based on item type
  const queryMethod = isNft ? api.query.nfts.collectionAccount : api.query.uniques.classAccount;
  const requests = addresses.map(async (address) => await queryMethod.entries(address));
  const entries = await Promise.all(requests);

  // collection id
  const collectionsId = entries
    .flat()
    .map(([key, _info]) => {
      const info = key.args.map((k) => k.toPrimitive());

      info.shift(); // first item is the address which we do not need it to fetch the collection information

      return info[0];
    });

  const collectionInfoQueryMethod = isNft ? [api.query.nfts.collection, api.query.nfts.collectionMetadataOf] : [api.query.uniques.class, api.query.uniques.classMetadataOf];
  const collectionsInformation =
    await Promise.all(collectionsId.map((collectionId) =>
      Promise.all([collectionInfoQueryMethod[0](collectionId), collectionInfoQueryMethod[1](collectionId)]))
    );

  const myCollections = collectionsInformation
    .map(([collection, collectionMetadata], index) => {
      const collectionId = collectionsId[index];
      const { items, owner } = collection.toPrimitive();
      const collectionMetadataInfo = collectionMetadata?.toPrimitive();

      return {
        chainName,
        collectionId,
        data: collectionMetadataInfo?.data ?? null,
        isCollection: true,
        isNft,
        items,
        owner: String(owner)
      };
    });

  return myCollections;
}

/**
 * Fetches NFT or unique items for a given chain and set of addresses
 * @param {ApiPromise} api - The API instance for interacting with the blockchain
 * @param {string[]} addresses - Array of addresses to fetch items for
 * @param {string} chainName - The chain identifier
 * @param {boolean} isNft - Whether to fetch NFTs (true) or uniques (false)
 * @returns {Promise<Array>} Array of item information
 */
async function fetchItems(api, addresses, chainName, isNft) {
  // Determine which query method to use based on item type
  const queryMethod = isNft ? api.query.nfts.account : api.query.uniques.account;
  const requests = addresses.map(async (address) => await queryMethod.entries(address));
  const entries = await Promise.all(requests);

  // owner, collection id, nft id
  const itemsInfo = entries
    .flat()
    .map(([key, _info]) => {
      const info = key.args.map((k) => k.toPrimitive());

      info.shift(); // first item is the address which we do not need it to fetch the item information

      return info;
    });

  const itemInfoQueryMethod = isNft ? api.query.nfts.item : api.query.uniques.asset;

  const itemsInformation = await Promise.all(itemsInfo.map(async (itemInfo) => await itemInfoQueryMethod(...itemInfo)));

  const myItems = itemsInformation
    .map((item, index) => {
      const [collectionId, itemId] = itemsInfo[index];

      return {
        ids: { collectionId, itemId },
        itemInfo: item.toPrimitive()
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

  return myItems
    .map(({ ids: { collectionId, itemId }, itemInfo }, index) => ({
      chainName,
      collectionId,
      creator: isNft ? String(itemInfo.deposit.account) : creators?.[collectionId],
      data: metadata[index],
      isCollection: false,
      isNft,
      itemId,
      owner: isNft ? String(itemInfo.owner) : itemInfo?.owner?.toString(),
      price: prices?.[index] ?? null
    }));
}

/**
 * Fetches both NFTs and uniques for a given chain
 * @param {ApiPromise} api - The API instance for interacting with the blockchain
 * @param {string[]} addresses - Array of addresses to fetch items for
 * @param {string} chainName - The chain identifier
 * @returns {Promise<ItemInformation[]>} Combined array of NFTs and uniques
 */
async function fetchNFTsForChain(api, addresses, chainName) {
  const [nfts, uniques, nftCollections, uniqueCollections] = await Promise.all([
    fetchItems(api, addresses, chainName, true),
    fetchItems(api, addresses, chainName, false),
    fetchCollections(api, addresses, chainName, true),
    fetchCollections(api, addresses, chainName, false)
  ]);

  return [...nftCollections, ...uniqueCollections, ...nfts, ...uniques];
}

/**
 * Fetches all NFTs and uniques across all configured chains
 * @param {string[]} addresses - Array of addresses to fetch items for
 * @returns {Promise<Record<string, ItemInformation[]>>} Combined array of all NFT and unique items and collections across all chains, categorized by addresses
 */
async function getNFTs(addresses) {
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
