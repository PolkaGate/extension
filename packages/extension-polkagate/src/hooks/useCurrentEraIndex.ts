// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import useChainInfo from './useChainInfo';

/**
 * Custom hook to retrieve the current era index for a given blockchain.
 *
 * This hook queries the blockchain's staking module to fetch the current era index.
 * The era index is returned as a number. If an error occurs during the query, the result will be `undefined`.
 *
 * @function useCurrentEraIndex
 * @param {string | undefined} genesisHash - The genesis hash of the blockchain to query for the current era index.
 * @returns {number | undefined} The current era index of the blockchain, or `undefined` if the index cannot be retrieved.
 */
export default function useCurrentEraIndex (genesisHash: string | undefined): number | undefined {
  const [index, setIndex] = useState<number>();
  const { api } = useChainInfo(genesisHash);

  useEffect(() => {
    api?.query['staking']?.['currentEra']().then((i) => {
      setIndex(Number(i?.toString() || '0'));
    }).catch(console.error);
  }, [api]);

  return index;
}
