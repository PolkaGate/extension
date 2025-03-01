// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useMemo } from 'react';

import { sanitizeChainName } from '../util/utils';
import { useAccount, useApi, useChain, useDecimal, useEndpoint, useFormatted, useToken } from '.';

interface AddressInfo {
  account: AccountJson | undefined;
  accountName: string | undefined;
  api: ApiPromise | undefined;
  chain: Chain | null | undefined;
  chainName: string | undefined;
  decimal: number | undefined;
  endpoint: string | undefined;
  formatted: string | undefined;
  genesisHash: string | undefined;
  token: string | undefined;
}

export default function useInfo(address: AccountId | string | undefined): AddressInfo {
  const account = useAccount(address);
  const api = useApi(address);
  const chain = useChain(address);
  const decimal = useDecimal(address);
  const { endpoint } = useEndpoint(address);
  const formatted = useFormatted(address);
  const token = useToken(address);

  return useMemo(() => ({
    account,
    accountName: account?.name,
    api,
    chain,
    chainName: sanitizeChainName(chain?.name),
    decimal,
    endpoint,
    formatted,
    genesisHash: chain?.genesisHash,
    token
  }), [account, api, chain, decimal, endpoint, formatted, token]);
}
