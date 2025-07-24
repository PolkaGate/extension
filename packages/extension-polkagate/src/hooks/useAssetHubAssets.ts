// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { bool, Bytes, StorageKey, u8, u128 } from '@polkadot/types';
import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { AnyTuple } from '@polkadot/types-codec/types';
import type { DropdownOption } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { getStorage, updateStorage } from '../components/Loading';
import { encodeMultiLocation } from '../util/utils';
import { useInfo } from '.';

/**
 * @description To get all available assets on asset hubs for an address based on its chain
 */
export default function useAssetHubAssets(address: AccountId | string | undefined): DropdownOption[] | undefined | null {
  const { api, genesisHash: accountGenesisHash } = useInfo(address);
  const [assets, setAssets] = useState<DropdownOption[] | null>();

  const handleAssetFetch = useCallback(async (assetType: string) => {
    if (!(api?.query[assetType] && api?.query[assetType]['asset'])) {
      return [];
    }

    const keys: StorageKey<AnyTuple>[] = await api.query[assetType]['asset'].keys();
    const assetIds = keys.map(({ args: [id] }) => id);

    if (!assetIds || !api?.query[assetType]?.['metadata']) {
      return [];
    }

    const metadata = await api?.query[assetType]?.['metadata'].multi(assetIds) as unknown as { 'deposit': u128, 'name': Bytes, 'symbol': Bytes, 'decimals': u8, 'isFrozen': bool }[];
    const assetOptions = metadata.map(({ name, symbol }, index) => {
      if (!symbol.toHuman()) {
        return undefined;
      }

      const assetIndex = assetType === 'assets' ? assetIds[index] as unknown as string : encodeMultiLocation(assetIds[index]) as string;

      return { text: `${assetType === 'assets' ? assetIndex : 'Foreign Asset'}: ${symbol.toHuman() as string} (${name.toHuman() as string})`, value: assetIndex.toString() };
    }).filter((item) => !!item);

    //@ts-ignore
    assetOptions.sort((a, b) => a.value - b.value);

    return assetOptions;
  }, [api]);

  const handleAllAssets = useCallback(async () => {
    const assets = await handleAssetFetch('assets');
    const foreignAssets = await handleAssetFetch('foreignAssets');

    const maybeAllAssets = assets.concat(foreignAssets);

    const allAssets = maybeAllAssets?.length ? maybeAllAssets : undefined;

    setAssets(allAssets);

    if (accountGenesisHash && api?.genesisHash.toString() === accountGenesisHash && allAssets?.length) {
      updateStorage('assetsOnAssetHub1', { [accountGenesisHash]: allAssets }).catch(console.error);
    }
  }, [accountGenesisHash, api?.genesisHash, handleAssetFetch]);

  const provideFromLocalStorage = useCallback(async () => {
    if (!accountGenesisHash) {
      return;
    }

    const maybeSavedAssetsAllAssetHubs = await getStorage('assetsOnAssetHub1').catch(console.error) as Record<string, DropdownOption[]>;
    const maybeSavedAssets = maybeSavedAssetsAllAssetHubs?.[accountGenesisHash];

    if (maybeSavedAssets) {
      setAssets(maybeSavedAssets);
    }
  }, [accountGenesisHash]);

  useEffect(() => {
    if (accountGenesisHash) {
      provideFromLocalStorage().catch(console.error);
    }

    if (!api || api.genesisHash.toString() !== accountGenesisHash) {
      return setAssets(undefined);
    }

    handleAllAssets().catch(console.error);
  }, [accountGenesisHash, api, handleAllAssets, provideFromLocalStorage]);

  return assets;
}
