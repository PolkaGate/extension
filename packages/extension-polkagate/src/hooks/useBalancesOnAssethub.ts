// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { bool, Bytes, Option, u8, u128 } from '@polkadot/types';
//@ts-ignore
import type { PalletAssetsAssetAccount, PalletAssetsAssetDetails } from '@polkadot/types/lookup';
import type { HexString } from '@polkadot/util/types';
import type { BalancesInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { ASSET_HUBS, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '../util/constants';
import { decodeMultiLocation } from '../util/utils';
import { useInfo } from '.';

export default function useBalancesOnAssethub(address: string | undefined, assetId?: string | number): BalancesInfo | undefined {
  const { api, chain, chainName, formatted } = useInfo(address);

  const isAssetHub = ASSET_HUBS.includes(chain?.genesisHash || '');

  const isForeignAsset = assetId ? typeof assetId === 'string' && assetId?.startsWith('0x') : undefined;

  const [assetBalance, setAssetBalance] = useState<BalancesInfo | undefined>();

  const fetchAssetOnAssetHub = useCallback(async () => {
    if (!api || !assetId) {
      return;
    }

    const section = isForeignAsset ? 'foreignAssets' : 'assets';
    const _assetId = isForeignAsset ? decodeMultiLocation(assetId as HexString) : assetId;

    try {
      const [accountAsset, assetInfo, metadata] = await Promise.all([
        api.query[section]['account'](_assetId, formatted) as unknown as Option<PalletAssetsAssetAccount>,
        api.query[section]['asset'](_assetId) as unknown as Option<PalletAssetsAssetDetails>,
        api.query[section]['metadata'](_assetId) as unknown as { deposit: u128, name: Bytes, symbol: Bytes, decimals: u8, isFrozen: bool }

      ]);

      const ED = assetInfo.isNone ? BN_ZERO : assetInfo.unwrap().minBalance;
      const _AccountAsset = accountAsset.isSome ? accountAsset.unwrap() : null;
      const isFrozen = isForeignAsset ? metadata.isFrozen.valueOf() : _AccountAsset?.status?.isFrozen;
      const balance = _AccountAsset?.balance || BN_ZERO;

      const assetBalances = {
        ED,
        assetId,
        availableBalance: isFrozen ? BN_ZERO : balance,
        chainName,
        date: Date.now(),
        decimal: metadata.decimals.toNumber(),
        freeBalance: !isFrozen ? balance : BN_ZERO,
        genesisHash: api.genesisHash.toHex(),
        isAsset: true,
        lockedBalance: isFrozen ? balance : BN_ZERO,
        reservedBalance: isFrozen ? balance : BN_ZERO, // JUST to comply with the rule that total=available + reserve
        token: metadata.symbol.toHuman() as string
      };

      setAssetBalance(assetBalances as unknown as BalancesInfo);
    } catch (error) {
      console.error(`Failed to fetch info for assetId ${assetId}:`, error);
    }
  }, [api, assetId, chainName, formatted, isForeignAsset]);

  useEffect(() => {
    if (assetId === undefined || assetId === NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB || !api?.query?.['assets'] || !isAssetHub) {
      return;
    }

    fetchAssetOnAssetHub().catch(console.error);
  }, [api, assetId, fetchAssetOnAssetHub, isAssetHub]);

  return assetBalance;
}
