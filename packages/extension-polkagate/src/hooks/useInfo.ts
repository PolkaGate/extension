// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { sanitizeChainName } from '../util/utils';
import { useApi, useChain, useDecimal, useEndpoint, useFormatted, useToken } from '.';

interface AddressInfo {
  api: ApiPromise | undefined;
  chain: Chain | null | undefined;
  chainName: string | undefined;
  decimal: number |undefined;
  endpoint: string | undefined;
  formatted: string |undefined;
  genesisHash: string |undefined;
  token: string |undefined
}

export default function useInfo (address: AccountId | string | undefined): AddressInfo {
  const token = useToken(address);
  const decimal = useDecimal(address);
  const api = useApi(address);
  const chain = useChain(address);
  const formatted = useFormatted(address);
  const endpoint = useEndpoint(address);

  return useMemo(() => ({
    api,
    chain,
    chainName: sanitizeChainName(chain?.name),
    decimal,
    endpoint,
    formatted,
    genesisHash: chain?.genesisHash,
    token
  }), [api, chain, decimal, endpoint, formatted, token]);
}
