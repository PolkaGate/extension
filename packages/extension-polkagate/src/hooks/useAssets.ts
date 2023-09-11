// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Option, StorageKey, u32 } from '@polkadot/types';

import { useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { DropdownOption } from '../util/types';
import { useApi, useGenesisHash } from '.';

export default function useAssets(address: AccountId | string | undefined): DropdownOption[] | undefined | null {
  const api = useApi(address);
  const accountGenesisHash = useGenesisHash(address);
  const [assets, setAssets] = useState<DropdownOption[] | null>();

  useEffect(() => {
    if (!api) {
      return setAssets(undefined);
    }

    if (api.genesisHash.toString() !== accountGenesisHash) {
      return setAssets(undefined);
    }

    api.query.assets && api.query.assets.asset
      ? api.query.assets.asset.keys().then((keys: StorageKey<[u32]>[]) => {
        const assetIds = keys.map(({ args: [id] }) => id);

        assetIds && api && api.query.assets && api.query.assets.asset.multi(assetIds).then((details: Option<PalletAssetsAssetDetails>[]) => {
          console.log('details:', JSON.parse(JSON.stringify(details)));
        });

        assetIds && api && api.query.assets && api.query.assets.metadata.multi(assetIds).then((metadata: Option<PalletAssetsAssetDetails>[]) => {
          console.log('metadata:', metadata);

          const assetOptions = metadata.map(({ name, symbol }, index) => {
            if (!symbol.toHuman()) {
              return;
            }

            return { text: `${assetIds[index]}: ${symbol.toHuman()} (${name.toHuman()})`, value: assetIds[index].toString() };
          }).filter((item) => !!item);

          assetOptions.sort((a, b) => a.value - b.value);
          setAssets(assetOptions);
        });
      }).catch(console.error)
      : setAssets(null);

    // api &&  api.query.assetRegistry.assetMetadatas('stableassetid').then((assetRegistry) => { // erc20, stableassetid, foreignassetid, nativeassetid
    //   console.log('assets::::',JSON.parse(JSON.stringify(assetRegistry)))
    // })
  }, [accountGenesisHash, api]);

  return assets;
}
