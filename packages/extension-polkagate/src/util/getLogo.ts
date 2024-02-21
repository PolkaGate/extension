// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createWsEndpoints, externalLinks } from '@polkagate/apps-config';
import { createAssets } from '@polkagate/apps-config/assets';

import { Chain } from '../../../extension-chains/src/types';
import { toCamelCase } from '../popup/governance/utils/util';
import getNetworkMap from './getNetworkMap';
import { sanitizeChainName } from './utils';

const endpoints = createWsEndpoints(() => '');

export default function getLogo(info: string | undefined | Chain, token?: string): string | undefined {
  if (token) {
    const networkMap = getNetworkMap();
    const chainName = networkMap.get(info as string || '');

    if (!chainName) {
      return undefined;
    }

    const assets = createAssets();
    const chainAssets = assets[toCamelCase(sanitizeChainName(chainName) || '')];

    return chainAssets?.find(({ symbol }) => symbol === token)?.ui?.logo
  }

  let mayBeExternalLogo;
  const iconName = sanitizeChainName(((info as Chain)?.name) || (info as string))?.toLowerCase();

  const endpoint = endpoints.find((o) => o.info?.toLowerCase() === iconName);

  if (!endpoint) {
    mayBeExternalLogo = Object
      .entries(externalLinks)
      .find(([name, { chains, create, homepage, isActive, paths, ui }]): React.ReactNode | null =>
        name.toLowerCase() === iconName
      );
  }

  const found = iconName ? (endpoint?.ui.logo || mayBeExternalLogo?.[1]?.ui?.logo) : undefined;

  return found as string;
}
