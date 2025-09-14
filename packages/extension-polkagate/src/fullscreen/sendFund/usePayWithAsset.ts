// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
// @ts-ignore
import type { PalletAssetsAssetMetadata } from '@polkadot/types/lookup';
import type { AnyNumber } from '@polkadot/types-codec/types';
import type { FeeAssetInfo } from './types';

import { useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { useChainInfo } from '../../hooks';

const getFeeAssetLocation = (api: ApiPromise, id: BN): AnyNumber | object => {
  const metadata = api.registry.metadata;
  const palletIndex = metadata.pallets.filter((a) => a.name.toString() === 'Assets')[0].index.toString();

  // FIX ME: it may not be applicable for all chains
  const palletInstance = { PalletInstance: palletIndex };
  const generalIndex = { GeneralIndex: id };

  return {
    interior: { X2: [palletInstance, generalIndex] },
    parents: 0
  };
};

export default function usePayWithAsset (genesisHash: string | undefined): FeeAssetInfo[] | undefined {
  const { api } = useChainInfo(genesisHash);
  const [feeAssetsInfo, setFeeAssetsInfo] = useState<FeeAssetInfo[]>();
  const [sufficientAssetIds, setSufficientAssetIds] = useState<BN[]>();

  useEffect(() => {
    if (!api) {
      return;
    }

    setFeeAssetsInfo(undefined);

    api.query['assets']?.['asset'].entries().then((res) => {
      const isSufficientAssets = res.filter(([, asset]) => {
        // @ts-ignore
        return asset.toPrimitive()?.isSufficient;
      });

      const ids = isSufficientAssets.map(([id, _]) => {
        const assetIdInHuman = id.toHuman() as string[];

        if (!assetIdInHuman?.[0]) {
          console.warn('Invalid asset ID format:', id.toHuman());

          return null;
        }

        try {
          return new BN(assetIdInHuman[0].replaceAll(',', ''));
        } catch (error) {
          console.error('Failed to parse asset ID:', assetIdInHuman[0], error);

          return null;
        }
      }).filter((id): id is BN => id !== null);

      setSufficientAssetIds(ids);
    }).catch(console.error);
  }, [api, genesisHash]);

  useEffect(() => {
    if (!api || !sufficientAssetIds?.length) {
      return;
    }

    api.query['assets']?.['metadata'].multi(sufficientAssetIds).then((res) => {
      const info = res.map((r, index) => {
        const id = sufficientAssetIds[index];

        return {
          id,
          multiLocation: getFeeAssetLocation(api, id),
          ...(r.toPrimitive() as unknown as PalletAssetsAssetMetadata)
        } as unknown as FeeAssetInfo;
      });

      setFeeAssetsInfo(info);
    }).catch(console.error);
  }, [api, sufficientAssetIds]);

  return feeAssetsInfo;
}
