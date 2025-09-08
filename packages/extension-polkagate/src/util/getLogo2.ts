// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { Chain } from '../../../extension-chains/src/types';

import { createWsEndpoints, externalLinks } from '@polkagate/apps-config';
import { createAssets } from '@polkagate/apps-config/assets';

import getNetworkMap from './getNetworkMap';
import { sanitizeChainName } from './utils';
import { toCamelCase } from '.';

const endpoints = createWsEndpoints();

export interface LogoInfo {
  logo?: string | undefined;
  logoSquare?: string | undefined;
  color?: string | undefined;
  subLogo?: string;
}

// info can be a chain, chain name, genesis hash or even an external dapp or web site name, but if info is a genesishash we must have the token as well
export default function getLogo2 (info: string | undefined | null | Chain, token?: string): LogoInfo | undefined {
  let chainNameFromGenesisHash;

  if (token) {
    const networkMap = getNetworkMap();

    chainNameFromGenesisHash = networkMap.get(info as string || '');

    if (!chainNameFromGenesisHash) {
      return undefined;
    }

    const assets = createAssets();

    const chainAssets = assets[toCamelCase(sanitizeChainName(chainNameFromGenesisHash) || '')];

    const found = chainAssets?.find(({ symbol }) => symbol.toUpperCase() === token.toUpperCase())?.ui;

    if (found) {
      return { ...found, subLogo: found.subLogo ? getLogo2(chainNameFromGenesisHash)?.logo : undefined };
    }
  }

  let maybeExternalLogo;
  const iconName = sanitizeChainName(chainNameFromGenesisHash || (info as Chain)?.name || (info as string))?.toLowerCase();

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
