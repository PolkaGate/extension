// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

//@ts-nocheck
import type React from 'react';
import type { Chain } from '../../../extension-chains/src/types';

import { createWsEndpoints, externalLinks } from '@polkagate/apps-config';
import { createAssets } from '@polkagate/apps-config/assets';

import { mapRelayToSystemGenesis } from './workers/utils/adjustGenesis';
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

export default function getLogo2(info: string | undefined | null | Chain, token?: string): LogoInfo | undefined {
  let chainNameFromGenesisHash;

  const _info = mapRelayToSystemGenesis(info as string);

  if (token) {
    const networkMap = getNetworkMap();

    chainNameFromGenesisHash = networkMap.get(_info || '');

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
  const iconName = sanitizeChainName(chainNameFromGenesisHash || (_info as Chain)?.name || (_info as string))?.toLowerCase();

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
