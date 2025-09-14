// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';

import { getParaId, getRelayChainSymbol, hasSupportForAsset, NODES_WITH_RELAY_CHAINS_DOT_KSM, type TNodeWithRelayChains } from '@paraspell/sdk-pjs';

import { NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '@polkadot/extension-polkagate/src/util/constants';
import { isOnAssetHub } from '@polkadot/extension-polkagate/src/util/utils';

export const XCM_LOC = ['xcm', 'xcmPallet', 'polkadotXcm'];
export const INVALID_PARA_ID = Number.MAX_SAFE_INTEGER;

export function normalizeChainName (label: string): string {
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

export const isOnSameChain = (senderChainName: string | undefined, recipientChainName: string | undefined) => {
  if (!senderChainName || !recipientChainName) {
    return;
  }

  const _senderChainName = normalizeChainName(senderChainName);
  const _recipientChainName = normalizeChainName(recipientChainName);

  return _senderChainName === _recipientChainName;
};

export function getSupportedDestinations (sourceChain: TNodeWithRelayChains | string, assetSymbol: string | undefined): DropdownOption[] {
  if (!assetSymbol) {
    return [];
  }

  const _sourceChainName = normalizeChainName(sourceChain) as TNodeWithRelayChains;
  const destinationChains = [{ text: _sourceChainName, value: getParaId(_sourceChainName) }];
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

export function isNativeAsset (api: ApiPromise, token: string, assetId: number | string) {
  const isAssetHub = isOnAssetHub(api.genesisHash.toHex());

  if (isAssetHub && Number(assetId) === NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB) {
    return true;
  }

  const nativeTokens = api.registry.chainTokens; // e.g., ['KSM']

  return nativeTokens.includes(token);
}
