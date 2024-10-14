// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ItemInformation, SavedNftItems } from '../fullscreen/nft/utils/types';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { AccountContext } from '../components';
import { useTranslation } from '../components/translate';
import { isHexToBn } from '../util/utils';
import useAlerts from './useAlerts';

export default function useNFT (address: string): ItemInformation[] | null | undefined {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const { notify } = useAlerts();
  const currentAddressRef = useRef(address);

  const [fetching, setFetching] = useState<boolean>(false);
  const [nfts, setNfts] = useState<ItemInformation[] | null | undefined>(undefined);

  const addresses = accounts.map(({ address: accountAddress }) => accountAddress);

  const saveToStorage = useCallback(async (data: SavedNftItems) => {
    await chrome.storage.local.set({ nftItems: JSON.stringify(data) });
  }, []);

  const getFromStorage = useCallback(async (): Promise<SavedNftItems | null> => {
    const result = await chrome.storage.local.get(['nftItems']);

    if (result['nftItems']) {
      return JSON.parse(result['nftItems'] as string) as SavedNftItems;
    }

    return null;
  }, []);

  const processAndSetNFTs = useCallback((data: SavedNftItems) => {
    if (!address) {
      return;
    }

    if (address in data) {
      const items = data[address];

      items.forEach((nftItem) => {
        if (nftItem.price) {
          // @ts-ignore
          nftItem.price = isHexToBn(nftItem.price);
        }
      });

      setNfts(
        items.length
          ? items
          : null
      );
    } else {
      setNfts(undefined);
    }
  }, [address]);

  const fetchNFTs = useCallback(() => {
    setFetching(true);
    const getNFTsWorker: Worker = new Worker(new URL('../util/workers/getNFTs.js', import.meta.url));

    getNFTsWorker.postMessage({ addresses });

    getNFTsWorker.onerror = (err) => {
      console.error('Worker error:', err);
      setFetching(false);
      getNFTsWorker.terminate();
    };

    getNFTsWorker.onmessage = (e: MessageEvent<string>) => {
      const NFTs = e.data;

      if (!NFTs) {
        notify(t('Unable to fetch NFT/Unique items!'), 'info');
        // setFetching(false);

        return;
      }

      let parsedNFTsInfo: SavedNftItems;

      try {
        parsedNFTsInfo = JSON.parse(NFTs) as SavedNftItems;
      } catch (error) {
        console.error('Failed to parse NFTs JSON:', error);
        setNfts(null);
        // setFetching(false);
        getNFTsWorker.terminate();

        return;
      }

      // console.log('All fetched NFTs:', parsedNFTsInfo);

      // Save all fetched items to Chrome storage
      saveToStorage(parsedNFTsInfo).catch(console.error);

      if (currentAddressRef.current !== address) {
        // Address has changed, no need to process and set setNFTs state
        // setFetching(false);
        getNFTsWorker.terminate();

        return;
      }

      processAndSetNFTs(parsedNFTsInfo);
      // setFetching(false);
      getNFTsWorker.terminate();
    };
  }, [address, addresses, notify, processAndSetNFTs, saveToStorage, t]);

  useEffect(() => {
    if (!fetching && addresses && addresses.length > 0) {
      fetchNFTs();
    }
  }, [addresses, fetching, fetchNFTs]);

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
