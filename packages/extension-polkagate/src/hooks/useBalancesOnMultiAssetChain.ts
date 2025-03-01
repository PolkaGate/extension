// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Asset } from '@polkagate/apps-config/assets/types';
import type { StorageKey } from '@polkadot/types';
//@ts-ignore
import type { OrmlTokensAccountData } from '@polkadot/types/lookup';
import type { AnyTuple } from '@polkadot/types/types';
import type { BalancesInfo } from '../util/types';

import { createAssets } from '@polkagate/apps-config/assets';
import { useCallback, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { toCamelCase } from '../fullscreen/governance/utils/util';
import { ASSET_HUBS } from '../util/constants';
import { useInfo } from '.';

const assetsChains = createAssets();

export default function useBalancesOnMultiAssetChain(address: string | undefined, assetId?: string | number): BalancesInfo | undefined {
  const { api, chain, chainName } = useInfo(address);

  const maybeAssetsOnMultiAssetChains = assetsChains[toCamelCase(chainName || '')];
  const isAssetHub = ASSET_HUBS.includes(chain?.genesisHash || '');

  const [assetBalance, setAssetBalance] = useState<BalancesInfo | undefined>();

  const fetchAssetOnMultiAssetChain = useCallback(async (assetInfo: Asset) => {
    if (!api) {
      return;
    }

    try {
      const assets: [StorageKey<AnyTuple>, OrmlTokensAccountData][] = await api.query['tokens']['accounts'].entries(address);
      const currencyIdScale = ((assetInfo.extras?.['currencyIdScale'] as string | undefined) || '').replace('0x', '');

      const found = assets.find((entry) => {
        if (!entry.length) {
          return false;
        }

        const storageKey = entry[0].toString();

        return storageKey.endsWith(currencyIdScale);
      });

      if (!found?.length) {
        return;
      }

      const currencyId = (found[0].toHuman() as string[])[1];
      const balance = found[1];

      const assetBalances = {
        ED: new BN(assetInfo.extras?.['existentialDeposit'] as string || 0),
        assetId: assetInfo.id,
        availableBalance: balance.free as BN,
        chainName,
        currencyId,
        decimal: assetInfo.decimal,
        freeBalance: balance.free as BN,
        genesisHash: api.genesisHash.toHex(),
        isAsset: true,
        reservedBalance: balance.reserved as BN,
        token: assetInfo.symbol
      };

      setAssetBalance(assetBalances as unknown as BalancesInfo);
    } catch (e) {
      console.error('Something went wrong while fetching an asset:', e);
    }
  }, [address, api, chainName]);

  useEffect(() => {
    if (api && assetId && maybeAssetsOnMultiAssetChains && !isAssetHub && typeof assetId === 'number') {
      const assetInfo = maybeAssetsOnMultiAssetChains[assetId];

      assetInfo && api.query['tokens'] && fetchAssetOnMultiAssetChain(assetInfo).catch(console.error);
    }
  }, [api, assetId, fetchAssetOnMultiAssetChain, isAssetHub, maybeAssetsOnMultiAssetChains]);

  return assetBalance;
}
