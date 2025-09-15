// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';

import { createWsEndpoints, externalLinks } from '@polkagate/apps-config';
import { createAssets } from '@polkagate/apps-config/assets';

import getChainName from './getChainName';
import getNetworkMap from './getNetworkMap';
import { isMigratedHub, mapRelayToSystemGenesisIfMigrated, mapSystemToRelay } from './migrateHubUtils';
import { sanitizeChainName } from './utils';
import { toCamelCase } from '.';

const endpoints = createWsEndpoints();

export interface LogoInfo {
  logo?: string | undefined;
  logoSquare?: string | undefined;
  color?: string | undefined;
  subLogo?: string;
}

// info can be a chain name, genesishash or even an external dapp or web site name, but if info is a genesishash we must have the token as well
export default function getLogo2 (info: string | undefined | null, token?: string): LogoInfo | undefined {
  if (!info) {
    return;
  }

  let chainNameFromGenesisHash;

  const _info = mapRelayToSystemGenesisIfMigrated(info);

  if (token) {
    const networkMap = getNetworkMap();

    chainNameFromGenesisHash = networkMap.get(_info || '');

    if (!chainNameFromGenesisHash) {
      return undefined;
    }

    const assets = createAssets(); // to fetch assets list from multi-asset chains

    const chainAssets = assets[toCamelCase(sanitizeChainName(chainNameFromGenesisHash) || '')];

    const found = chainAssets?.find(({ symbol }) => symbol.toUpperCase() === token.toUpperCase())?.ui;
    const subLogo = found?.subLogo && !isMigratedHub(_info)
      ? getLogo2(chainNameFromGenesisHash)?.logo
      : undefined;

    if (found) {
      return { ...found, subLogo };
    }

    // if it is not an asset on multi asset chain but a token on a system chain like people chain
    const relayGenesis = mapSystemToRelay(info, false);

    if (relayGenesis && relayGenesis !== info) {
      chainNameFromGenesisHash = getChainName(relayGenesis);
    }
  }

  let maybeExternalLogo;
  const chainName = chainNameFromGenesisHash || getChainName(_info) || _info;
  const iconName = sanitizeChainName(chainName)?.toLowerCase();

  const endpoint = endpoints.find((o) => o.info?.toLowerCase() === iconName);

  if (!endpoint) {
    maybeExternalLogo = Object
      .entries(externalLinks)
      .find(([name]): React.ReactNode | null =>
        name.toLowerCase() === iconName
      );
  }

  const found = iconName ? (endpoint?.ui || maybeExternalLogo?.[1]?.ui) : undefined;

  return found;
}
