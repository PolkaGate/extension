// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountInfo } from '@polkadot/api-derive/types';
import type { PalletIdentityRegistration } from '@polkadot/types/lookup';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';
import { hexToString } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';

import { PEOPLE_CHAINS } from '../util/constants';
import { useApiWithChain2, usePeopleChain } from '.';

export default function useAccountsInfo (api: ApiPromise | undefined, chain: Chain | null | undefined): DeriveAccountInfo[] | undefined {
  const [infos, setInfos] = useState<DeriveAccountInfo[] | undefined>();
  const [fetching, setFetching] = useState<boolean>(false);

  const { peopleChain } = usePeopleChain(undefined, chain?.genesisHash);
  const peopleChainApi = useApiWithChain2(peopleChain);
  const isPeopleChainEnabled = PEOPLE_CHAINS.includes(chain?.name || '');

  const _api = useMemo(() => isPeopleChainEnabled ? peopleChainApi : api, [api, isPeopleChainEnabled, peopleChainApi]);

  const getAccountsInfo = useCallback(() => {
    try {
      setFetching(true);
      _api && _api.query.identity.identityOf.entries().then((ids) => {
        console.log(`${ids?.length} accountsInfo fetched from ${chain?.name ?? ''}`);

        const fetchedAccountsInfo = ids.map(([key, value]) => {
          const { info, judgements } = value.unwrap()[0] as PalletIdentityRegistration;

          return {
            accountId: encodeAddress('0x' + key.toString().slice(82), chain?.ss58Format),
            identity: {
              display: hexToString(info.display.asRaw.toHex()),
              email: hexToString(info.email.asRaw.toHex()),
              judgements,
              legal: hexToString(info.legal.asRaw.toHex()),
              riot: hexToString((info.riot || info.matrix).asRaw.toHex()),
              twitter: hexToString(info.twitter.asRaw.toHex()),
              web: hexToString(info.web.asRaw.toHex())
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
  }, [_api, chain]);

  useEffect(() => {
    if (!_api || !chain || !chain.genesisHash || !chain.name || !chain.ss58Format || fetching) {
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
  }, [_api, chain, fetching, getAccountsInfo]);

  return infos;
}
