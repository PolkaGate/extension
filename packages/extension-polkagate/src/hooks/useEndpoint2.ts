// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { createWsEndpoints } from '@polkadot/apps-config';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { SavedMetaData } from '../util/types';
import { useAccount, useChainName } from '.';

export default function useEndpoint2(address: AccountId | string | undefined): string | undefined {
  const account = useAccount(address);
  const chainName = useChainName(address);

  const endpoint = useMemo(() => {
    // const account = Array.isArray(accounts) ? accounts.find((account) => account.address === address) : accounts;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const endPointFromStore: SavedMetaData = account?.endpoint ? JSON.parse(account.endpoint) : null;

    if (endPointFromStore && endPointFromStore?.chainName === chainName) {
      return endPointFromStore.metaData as string;
    }

    const allEndpoints = createWsEndpoints((key: string, value: string | undefined) => value || key);

    const endpoints = allEndpoints?.filter((e) => String(e.text)?.toLowerCase() === chainName?.toLowerCase());

    return endpoints?.length ? endpoints[endpoints.length > 2 ? 1 : 0].value : undefined;
  }, [account, chainName]);

  return endpoint;
}
