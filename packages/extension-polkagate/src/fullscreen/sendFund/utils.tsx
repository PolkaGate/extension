// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

//@ts-nocheck
import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';

import { getAssetId, getAssetsObject, getParaId, getRelayChainSymbol, hasSupportForAsset, NODES_WITH_RELAY_CHAINS_DOT_KSM, type TNodeWithRelayChains } from '@paraspell/sdk-pjs';

import { ASSET_HUBS } from '@polkadot/extension-polkagate/src/util/constants';

export const XCM_LOC = ['xcm', 'xcmPallet', 'polkadotXcm'];
export const INVALID_PARA_ID = Number.MAX_SAFE_INTEGER;
export const isAssethub = (genesisHash?: string) => ASSET_HUBS.includes(genesisHash || '');

export function reorderAssetHubLabel (label: string): string {
  if (label.endsWith('AssetHub')) {
    return 'AssetHub' + label.replace('AssetHub', '');
  }

  if (label.endsWith('Collectives')) {
    return 'Collectives' + label.replace('Collectives', '');
  }

  if (label.endsWith('People')) {
    return 'People' + label.replace('People', '');
  }

  return label; // return unchanged if it doesn't match known pattern
}

export function getSupportedDestinations (sourceChain: TNodeWithRelayChains | string, assetSymbol: string | undefined): DropdownOption[] {
  const _sourceChainName = reorderAssetHubLabel(sourceChain as string);
  const destinationChains = [{ text: _sourceChainName, value: getParaId(_sourceChainName)}];
  const sourceRelayChainSymbol = getRelayChainSymbol(_sourceChainName);

  for (const chain of NODES_WITH_RELAY_CHAINS_DOT_KSM) {
    if (chain !== _sourceChainName) {
      const isSupported = hasSupportForAsset(chain, assetSymbol);

      const isPolkadotKusamaBridge = _sourceChainName.toLowerCase().includes('assethub') && chain.toLowerCase().includes('assethub');

      const maybeDestinationRelayChainSymbol = getRelayChainSymbol(chain);
      const isOnSameRelay = sourceRelayChainSymbol === maybeDestinationRelayChainSymbol;

      if (isSupported && (isOnSameRelay || isPolkadotKusamaBridge)) {
        destinationChains.push({ text: chain, value: getParaId(chain) });
      }
    }
  }

  return destinationChains;
}

export function getAssetSymbol (sourceChain: TNodeWithRelayChains | string, assetId: string | undefined): string | undefined {
  try {
    const assetObject = getAssetsObject(sourceChain);

    const assets = assetObject.nativeAssets.concat(assetObject.otherAssets);

    for (const asset of assets) {
      if (getAssetId(sourceChain, asset.symbol) === assetId) {
        return asset.symbol;
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
}
