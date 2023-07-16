// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { createWsEndpoints } from '@polkadot/apps-config';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { SavedMetaData } from '../util/types';
import { useAccount, useChainName, useTranslation } from '.';

export default function useEndpoint2(address: AccountId | string | undefined): string | undefined {
  const account = useAccount(address);
  const chainName = useChainName(address);
  const { t } = useTranslation();

  const endpoint = useMemo(() => {
    const endPointFromStore: SavedMetaData = account?.endpoint ? JSON.parse(account.endpoint) : null;

    if (endPointFromStore && endPointFromStore?.chainName === chainName) {
      return endPointFromStore.metaData as string;
    }

    const allEndpoints = createWsEndpoints(t);

    const endpoints = allEndpoints?.filter((e) => e.value &&
      (String(e.info)?.toLowerCase() === chainName?.toLowerCase() ||
        String(e.text)?.toLowerCase()?.includes(chainName?.toLowerCase()))
    );

    // return endpoints?.length ? endpoints[endpoints.length > 2 ? 1 : 0].value : undefined;
    return endpoints?.length ? endpoints[0].value : undefined;
  }, [account?.endpoint, chainName, t]);

  return endpoint;
}
