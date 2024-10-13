// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ItemInformation } from '../fullscreen/nft/utils/types';

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountContext } from '../components';
import { useTranslation } from '../components/translate';
import { getFormattedAddress, isHexToBn } from '../util/utils';
// eslint-disable-next-line import/extensions
import { SUPPORTED_NFT_CHAINS } from '../util/workers/getNFTs';
import useAlerts from './useAlerts';

export default function useNFT (address: string): ItemInformation[] | null | undefined {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const { notify } = useAlerts();

  const myFormattedAddresses = useMemo(() =>
    Object.values(SUPPORTED_NFT_CHAINS).map(({ prefix }) =>
      getFormattedAddress(address, undefined, prefix)
    ), [address]);

  const [fetching, setFetching] = useState<boolean>(false);
  const [nfts, setNfts] = useState<ItemInformation[] | null | undefined>(undefined);

  const addresses = accounts.map(({ address: accountAddress }) => accountAddress);

  const saveToStorage = useCallback(async (items: ItemInformation[]) => {
    await chrome.storage.local.set({ nftItems: JSON.stringify(items) });
  }, []);

  const filterItemsByAddress = useCallback((items: ItemInformation[], addressToFilter: string[]) => {
    return items.filter(({ creator, owner }) => addressToFilter.includes(creator ?? '') || addressToFilter.includes(owner));
  }, []);

  const getFromStorage = useCallback(async (): Promise<ItemInformation[] | null> => {
    const result = await chrome.storage.local.get(['nftItems']);

    if (result['nftItems']) {
      return JSON.parse(result['nftItems'] as string) as ItemInformation[];
    }

    return null;
  }, []);

  const processAndSetNFTs = useCallback((items: ItemInformation[]) => {
    if (myFormattedAddresses.length === 0) {
      return;
    }

    items.forEach((nftItem) => {
      if (nftItem.price) {
        // @ts-ignore
        nftItem.price = isHexToBn(nftItem.price);
      }
    });

    const filteredItems = filterItemsByAddress(items, myFormattedAddresses);

    setNfts(
      filteredItems.length
        ? filteredItems
        : null
    );
  }, [myFormattedAddresses, filterItemsByAddress]);

  const getNFTs = useCallback(() => {
    setFetching(true);
    const getNFTsWorker: Worker = new Worker(new URL('../util/workers/getNFTs.js', import.meta.url));

    getNFTsWorker.postMessage({ addresses });

    getNFTsWorker.onerror = (err) => {
      console.error('Worker error:', err);
      setFetching(false);
    };

    getNFTsWorker.onmessage = (e: MessageEvent<string>) => {
      const NFTs = e.data;

      if (!NFTs) {
        notify(t('Unable to fetch NFT/Unique items!'), 'info');
        setFetching(false);

        return;
      }

      const parsedNFTsInfo = JSON.parse(NFTs) as ItemInformation[];

      parsedNFTsInfo?.forEach((nftItem) => {
        if (nftItem.price) {
          // @ts-ignore
          nftItem.price = isHexToBn(nftItem.price);
        }
      });

      // console.log('All fetched NFTs:', parsedNFTsInfo);

      // Save all fetched items to Chrome storage
      saveToStorage(parsedNFTsInfo).catch(console.error);

      processAndSetNFTs(parsedNFTsInfo);
      setFetching(false);
      getNFTsWorker.terminate();
    };
  }, [addresses, notify, processAndSetNFTs, saveToStorage, t]);

  useEffect(() => {
    if (!fetching && addresses && addresses.length > 0) {
      getNFTs();
    }
  }, [addresses, fetching, getNFTs]);

  useEffect(() => {
    setNfts(undefined);

    getFromStorage()
      .then((storedItems) => {
        if (storedItems) {
          // console.log('Fetched NFTs from storage:', storedItems);
          processAndSetNFTs(storedItems);
        }
      })
      .catch(console.error);
  }, [getFromStorage, processAndSetNFTs]);

  return nfts;
}