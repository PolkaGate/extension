// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';

import { getParaId, getRelayChainSymbol, hasSupportForAsset, SUBSTRATE_CHAINS, type TSubstrateChain } from '@paraspell/sdk-pjs';

import { NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '@polkadot/extension-polkagate/src/util/constants';
import { isMigratedByChainName } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';
import { isOnAssetHub } from '@polkadot/extension-polkagate/src/util/utils';

export const XCM_LOC = ['xcm', 'xcmPallet', 'polkadotXcm'];
export const INVALID_PARA_ID = Number.MAX_SAFE_INTEGER;

function capitalizeFirst (str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function normalizeChainName (name: string): string {
  if (name.endsWith('AssetHub') || isMigratedByChainName(name)) {
    return 'AssetHub' + capitalizeFirst(name.replace('AssetHub', ''));
  }

  if (name.endsWith('Collectives')) {
    return 'Collectives' + capitalizeFirst(name.replace('Collectives', ''));
  }

  if (name.endsWith('People')) {
    return 'People' + capitalizeFirst(name.replace('People', ''));
  }

  return name; // return unchanged if it doesn't match known pattern
}

export const isOnSameChain = (senderChainName: string | undefined, recipientChainName: string | undefined) => {
  if (!senderChainName || !recipientChainName) {
    return;
  }

  const _senderChainName = normalizeChainName(senderChainName);
  const _recipientChainName = normalizeChainName(recipientChainName);

  return _senderChainName === _recipientChainName;
};

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export function getSupportedDestinations (sourceChain: TSubstrateChain | string, assetSymbol: string | undefined): DropdownOption[] {
  if (!assetSymbol) {
    return [];
  }

  const _sourceChainName = normalizeChainName(sourceChain) as TSubstrateChain;
  const destinationChains = [{ text: _sourceChainName, value: getParaId(_sourceChainName) }];
  const sourceRelayChainSymbol = getRelayChainSymbol(_sourceChainName);

  for (const chain of SUBSTRATE_CHAINS) {
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
