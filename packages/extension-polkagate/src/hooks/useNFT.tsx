// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { NftItemsType } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import NftManager from '../class/nftManager';
import { useTranslation } from '../components/translate';
import useAlerts from './useAlerts';
import { useWorker } from './useWorker';

export interface NftItemsWorker {
  functionName: string;
  results: NftItemsType;
}

const nftManager = new NftManager();
const NFT_FUNCTION_NAME = 'getNFTs';

export default function useNFT(accountsFromContext: AccountJson[] | null) {
  const { t } = useTranslation();
  const { notify } = useAlerts();
  const worker = useWorker();

  const [fetching, setFetching] = useState<boolean>(false);

  const onWhitelistedPath = window.location.hash === '#/' || window.location.hash.startsWith('#/accountfs') || window.location.hash.startsWith('#/nft');
  const addresses = (accountsFromContext || []).map(({ address: accountAddress }) => accountAddress);

  const saveToStorage = useCallback((data: NftItemsType) => {
    nftManager.setOnChainItemsInfo(data);
  }, []);

  const fetchNFTs = useCallback((addresses: string[]) => {
    setFetching(true);
    worker.postMessage({ functionName: NFT_FUNCTION_NAME, parameters: { addresses } });

    const handleMessage = (messageEvent: MessageEvent<string>) => {
      const NFTs = messageEvent.data;

      if (!NFTs) {
        notify(t('Unable to fetch NFT/Unique items!'), 'info');
        // setFetching(false);

        return;
      }

      let parsedNFTsInfo: NftItemsWorker;

      try {
        parsedNFTsInfo = JSON.parse(NFTs) as NftItemsWorker;

        // console.log('All fetched NFTs:', parsedNFTsInfo);

        if (parsedNFTsInfo.functionName !== NFT_FUNCTION_NAME) {
          return;
        }
      } catch (error) {
        console.error('Failed to parse NFTs JSON:', error);
        // setFetching(false);

        return;
      }

      // Save all fetched items to Chrome storage
      saveToStorage(parsedNFTsInfo.results);

      // setFetching(false);
    };

    worker.addEventListener('message', handleMessage);

    return () => {
      worker.removeEventListener('message', handleMessage);
    };
  }, [notify, saveToStorage, t, worker]);

  useEffect(() => {
    if (!fetching && addresses && addresses.length > 0 && onWhitelistedPath) {
      fetchNFTs(addresses);
    }
  }, [addresses, fetching, fetchNFTs, onWhitelistedPath]);
}
