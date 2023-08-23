// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { useCallback, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';
import { hexToString } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';

export default function useAccountsInfo(api: ApiPromise | undefined, chain: Chain | null | undefined): DeriveAccountInfo[] | undefined {
  const [infos, setInfos] = useState<DeriveAccountInfo[] | undefined>();
  const [fetching, setFetching] = useState<boolean>(false);

  const getAccountsInfo = useCallback(() => {
    try {
      setFetching(true);
      api && api.query.identity.identityOf.entries().then((ids) => {
        console.log(`${ids?.length} accountsInfo fetched from ${chain?.name ?? ''}`);

        const fetchedAccountsInfo = ids.map(([key, option]) => {
          return {
            accountId: encodeAddress('0x' + key.toString().slice(82), chain?.ss58Format),
            identity: {
              judgements: option.unwrap().judgements,
              display: hexToString(option.unwrap().info.display.asRaw.toHex()),
              email: hexToString(option.unwrap().info.email.asRaw.toHex()),
              legal: hexToString(option.unwrap().info.legal.asRaw.toHex()),
              riot: hexToString(option.unwrap().info.riot.asRaw.toHex()),
              twitter: hexToString(option.unwrap().info.twitter.asRaw.toHex()),
              web: hexToString(option.unwrap().info.web.asRaw.toHex()),
            }
          };
        });

        setInfos(fetchedAccountsInfo);

        // eslint-disable-next-line no-void
        chrome.storage.local.get('AccountsInfo', (res) => {
          const k = `${chain?.genesisHash}`;
          const last = res?.Convictions || {};

          last[k] = JSON.stringify(fetchedAccountsInfo);

          // eslint-disable-next-line no-void
          void chrome.storage.local.set({ AccountsInfo: last });
        });
      }).catch(console.error);
      setFetching(false);
    } catch (error) {
      setInfos(undefined);
      setFetching(false);
    }
  }, [api, chain]);

  useEffect(() => {
    if (!api || !chain || !chain.genesisHash || !chain.name || !chain.ss58Format || fetching || api.genesisHash.toHex() !== chain.genesisHash) {
      return;
    }

    chrome.storage.local.get('AccountsInfo', (res) => {
      console.log('AccountsInfo in local storage:', res);

      if (res?.AccountsInfo?.[chain.genesisHash]) {
        const parsedInfos = JSON.parse(res.AccountsInfo?.[chain?.genesisHash]);

        setInfos(parsedInfos);
      }
    });

    getAccountsInfo();
  }, [api, chain, fetching, getAccountsInfo]);

  return infos;
}
