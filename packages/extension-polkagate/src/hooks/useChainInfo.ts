// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';

import { selectableNetworks } from '@polkadot/networks';

import { sanitizeChainName } from '../util/utils';
import { useApiWithChain2, useMetadata } from '.';

interface ChainInfo {
  api: ApiPromise | undefined;
  chain: Chain | null | undefined;
  chainName: string | undefined;
  decimal: number | undefined;
  token: string | undefined;
}

export default function useChainInfo (genesisHash: string | null | undefined): ChainInfo {
  const chain = useMetadata(genesisHash);
  const api = useApiWithChain2(chain);
  const chainInfo = selectableNetworks.find(({ genesisHash: chainGenesisHash }) => chainGenesisHash[0] === genesisHash);

  return {
    api,
    chain,
    chainName: sanitizeChainName(chainInfo?.displayName),
    decimal: chainInfo?.decimals[0],
    token: chainInfo?.symbols[0]
  };
}
