// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createWsEndpoints, externalLinks } from '@polkagate/apps-config';
import { createAssets } from '@polkagate/apps-config/assets';

import { Chain } from '../../../extension-chains/src/types';
import { toCamelCase } from '../popup/governance/utils/util';
import getNetworkMap from './getNetworkMap';
import { sanitizeChainName } from './utils';

const endpoints = createWsEndpoints(() => '');

export interface AssetUI {
  logo: string;
  color: string;
}

export default function getLogo2 (info: string | undefined | Chain, token?: string): AssetUI | undefined {
  let chainNameFromGenesisHash;

  if (token) {
    const networkMap = getNetworkMap();

    chainNameFromGenesisHash = networkMap.get(info as string || '');

    if (!chainNameFromGenesisHash) {
      return undefined;
    }

    const assets = createAssets();
    const chainAssets = assets[toCamelCase(sanitizeChainName(chainNameFromGenesisHash) || '')];

    const found = chainAssets?.find(({ symbol }) => symbol === token)?.ui;

    if (found) {
      return found;
    }
  }

  let mayBeExternalLogo;
  const iconName = sanitizeChainName(chainNameFromGenesisHash || (info as Chain)?.name || (info as string))?.toLowerCase();

  const endpoint = endpoints.find((o) => o.info?.toLowerCase() === iconName);

  if (!endpoint) {
    mayBeExternalLogo = Object
      .entries(externalLinks)
      .find(([name, { chains, create, homepage, isActive, paths, ui }]): React.ReactNode | null =>
        name.toLowerCase() === iconName
      );
  }

  const found = iconName ? (endpoint?.ui || mayBeExternalLogo?.[1]?.ui) : undefined;

  return found;
}
