// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Theme } from '@mui/material';
import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { SavedAssets } from '../hooks/useAssetsBalances';
import type { DropdownOption, FastestConnectionType, UserAddedChains } from './types';

import { BN } from '@polkadot/util';

import { EXTRA_PRICE_IDS } from './api/getPrices';
import { fastestEndpoint } from './workers/utils';
import { getSubstrateAddress } from './address';
import { sanitizeChainName } from './chain';
import { PROFILE_COLORS } from './constants';

export const accountName = (accounts: AccountJson[], address: string | undefined): string | undefined => {
  if (!accounts.length || !address) {
    return undefined;
  }

  const addr = getSubstrateAddress(address);

  return accounts.find((acc) => acc.address === addr)?.name;
};

export const getWebsiteFavicon = (url: string | undefined): string => {
  if (!url) {
    return '';
  }

  return 'https://s2.googleusercontent.com/s2/favicons?domain=' + url;
};

export const isEqual = (a1: unknown[] | null, a2: unknown[] | null): boolean => {
  if (!a1 && !a2) {
    return true;
  }

  if (!(a1 || a2)) {
    return false;
  }

  const a1Sorted = a1?.slice().sort();
  const a2Sorted = a2?.slice().sort();

  return JSON.stringify(a1Sorted) === JSON.stringify(a2Sorted);
};

export const isEmail = (input: string | undefined) => {
  if (!input) {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(input);
};

export const isUrl = (input: string | undefined) => {
  if (!input) {
    return false;
  }

  const urlRegex = /^(https?:\/\/)?([\w\d]+\.)+[\w\d]{2,6}(\/[\w\d]+)*$/;

  return urlRegex.test(input);
};

export const isWss = (input: string | undefined): boolean => {
  if (!input) {
    return false;
  }

  const urlRegex = /^wss:\/\/([\w\d-]+\.)+[\w\d-]{2,}(:\d+)?(\/[\w\d\-._~:/?#\[\]@!$&'()*+,;=]*)?$/i;

  return urlRegex.test(input);
};

export const pgBoxShadow = (theme: Theme): string => theme.palette.mode === 'dark' ? '0px 4px 4px rgba(255, 255, 255, 0.25)' : '2px 3px 4px 0px rgba(0, 0, 0, 0.10)';

export const truncString32Bytes = (input: string | null | undefined): string | null | undefined => {
  if (!input) {
    return input;
  }

  const encoder = new TextEncoder();
  let byteLength = encoder.encode(input).length;
  let inputVal = input;

  while (byteLength > 32) {
    inputVal = inputVal.substring(0, inputVal.length - 1);
    byteLength = encoder.encode(inputVal).length;
  }

  return inputVal;
};

export const getProfileColor = (index: number, theme: Theme): string => {
  if (index >= 0) {
    const _index = index % PROFILE_COLORS.length; // to return colors recursively

    return PROFILE_COLORS[_index][theme.palette.mode];
  }

  return PROFILE_COLORS[0][theme.palette.mode];
};

export const getPriceIdByChainName = (chainName?: string, useAddedChains?: UserAddedChains) => {
  if (!chainName) {
    return '';
  }

  if (useAddedChains) {
    const maybeUserAddedPriceId = Object.entries(useAddedChains).find(([_, { chain }]) => chain?.replace(/\s/g, '')?.toLowerCase() === chainName.toLowerCase())?.[1]?.priceId;

    if (maybeUserAddedPriceId) {
      return maybeUserAddedPriceId;
    }
  }

  const _chainName = (sanitizeChainName(chainName) as unknown as string).toLocaleLowerCase();

  return EXTRA_PRICE_IDS[_chainName] ||
    _chainName?.replace('assethub', '')?.replace('people', '');
};

export function areArraysEqual<T> (arrays: T[][]): boolean {
  if (arrays.length < 2) {
    return true; // Single array or empty input is considered equal
  }

  const referenceArrayLength = arrays[0].length;

  // Check if all inputs are arrays of the same length
  const allValidArrays = arrays.every((arr) => Array.isArray(arr) && arr.length === referenceArrayLength);

  if (!allValidArrays) {
    return false;
  }

  // Create sorted copies of the arrays
  const sortedArrays = arrays.map((arr) => arr.sort());

  // Compare each sorted array with the first sorted array
  return sortedArrays.every((s) =>
    s.every((element, index) => element === sortedArrays[0][index])
  );
}

export function extractBaseUrl (url: string | undefined) {
  try {
    if (!url) {
      return;
    }

    const urlObj = new URL(url);

    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch (error) {
    console.error('Invalid URL:', error);

    return null;
  }
}

export async function fastestConnection (endpoints: DropdownOption[]): Promise<FastestConnectionType> {
  try {
    const urls = endpoints.map(({ value }) => ({ value: value as string }));
    const { api, connections } = await fastestEndpoint(urls);

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const selectedEndpoint = api.registry.knownTypes.provider.endpoint as string;
    const connectionsToDisconnect = connections.filter(({ wsProvider }) => wsProvider.endpoint !== selectedEndpoint);

    connectionsToDisconnect.forEach(({ wsProvider }) => {
      wsProvider.disconnect().catch(console.error);
    });

    return {
      api,
      selectedEndpoint
    };
  } catch (error) {
    console.error('Unable to make an API connection!', error);

    return {
      api: undefined,
      selectedEndpoint: undefined
    };
  }
}

// Remove zero balance records
export const removeZeroBalanceRecords = (toBeSavedAssets: SavedAssets): SavedAssets => {
  const _toBeSavedAssets = { ...toBeSavedAssets };
  const balances = (_toBeSavedAssets)?.balances || [];

  Object.entries(balances).forEach(([address, assetsPerChain]) => {
    Object.entries(assetsPerChain).forEach(([genesisHash, fetchedBalance]) => {
      const toBeDeletedIndexes: string[] = [];

      fetchedBalance.forEach(({ token, totalBalance }) => {
        if (new BN(totalBalance).isZero()) {
          toBeDeletedIndexes.push(token);
        }
      });
      toBeDeletedIndexes.forEach((_token) => {
        const index = _toBeSavedAssets.balances[address][genesisHash].findIndex(({ token }) => _token === token);

        index >= 0 && _toBeSavedAssets.balances[address][genesisHash].splice(index, 1);
      });

      if (!_toBeSavedAssets.balances[address][genesisHash].length) {
        delete _toBeSavedAssets.balances[address][genesisHash];
      }
    });
  });

  return _toBeSavedAssets;
};