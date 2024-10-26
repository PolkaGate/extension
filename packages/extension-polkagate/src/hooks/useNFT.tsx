// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { NftItemsType} from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import NftManager from '../class/nftManager';
import { useTranslation } from '../components/translate';
import useAlerts from './useAlerts';

const nftManager = new NftManager();

export default function useNFT (accountsFromContext: AccountJson[] | null) {
  const { t } = useTranslation();
  const { notify } = useAlerts();

  const [fetching, setFetching] = useState<boolean>(false);

  const onWhitelistedPath = window.location.hash === '#/' || window.location.hash.startsWith('#/accountfs') || window.location.hash.startsWith('#/nft');
  const addresses = (accountsFromContext || []).map(({ address: accountAddress }) => accountAddress);

  const saveToStorage = useCallback((data: NftItemsType) => {
    nftManager.setOnChainItemsInfo(data);
  }, []);

  const fetchNFTs = useCallback((addresses: string[]) => {
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

      let parsedNFTsInfo: NftItemsType;

      try {
        parsedNFTsInfo = JSON.parse(NFTs) as NftItemsType;
      } catch (error) {
        console.error('Failed to parse NFTs JSON:', error);
        // setFetching(false);
        getNFTsWorker.terminate();

        return;
      }

      // console.log('All fetched NFTs:', parsedNFTsInfo);

      // Save all fetched items to Chrome storage
      saveToStorage(parsedNFTsInfo);

      // setFetching(false);
      getNFTsWorker.terminate();
    };
  }, [notify, saveToStorage, t]);

  useEffect(() => {
    if (!fetching && addresses && addresses.length > 0 && onWhitelistedPath) {
      fetchNFTs(addresses);
    }
  }, [addresses, fetching, fetchNFTs, onWhitelistedPath]);
}
