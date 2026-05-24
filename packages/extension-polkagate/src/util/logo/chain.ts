// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { LogoInfo, ResolveLogoInfoOptions } from './types';

import { externalLinks } from '@polkagate/apps-config';

import { sanitizeChainName } from '../chain';
import { ETH_CHAINS_GENESISHASH } from '../evmUtils/constantsEth';
import getChainName from '../getChainName';
import { endpoints, ETHChainsWithEthLogo } from './constants';
import { getEthereumLogos } from './ethereum';
import { mayGetChainName, normalizeToWordKey } from './helpers';

function getTokenLogoOnSingleAssetChain(iconName: string | undefined): LogoInfo | undefined {
  const normalizedIconName = normalizeToWordKey(iconName);
  const endpoint = endpoints.find((o) =>
    o.info?.toLowerCase() === iconName ||
    normalizeToWordKey(o.info) === normalizedIconName ||
    (typeof o.text === 'string' && normalizeToWordKey(sanitizeChainName(o.text)) === normalizedIconName)
  );

  return iconName ? endpoint?.ui : undefined;
}

function getExternalLogo(iconName: string | undefined): LogoInfo | undefined {
  const maybeExternalLogo = Object
    .entries(externalLinks)
    .find(([name]): React.ReactNode | null => name.toLowerCase() === iconName);

  return iconName ? maybeExternalLogo?.[1]?.ui : undefined;
}

export function resolveChainLogoInfo(
  info: string | undefined | null,
  options?: ResolveLogoInfoOptions
): LogoInfo | undefined {
  if (options?.externalLogo) {
    return options.externalLogo;
  }

  const normalizedInfo = typeof info === 'string' ? info : undefined;

  if (!normalizedInfo) {
    return undefined;
  }

  const lcInfo = normalizedInfo.toLowerCase();

  if (ETHChainsWithEthLogo.includes(lcInfo) || ETH_CHAINS_GENESISHASH.includes(normalizedInfo)) {
    return getEthereumLogos(lcInfo);
  }

  const chainName = mayGetChainName(normalizedInfo) || getChainName(normalizedInfo) || normalizedInfo;
  const iconName = sanitizeChainName(chainName)?.toLowerCase();
  const chainLogo = getTokenLogoOnSingleAssetChain(iconName);

  if (chainLogo) {
    return chainLogo;
  }

  return getExternalLogo(iconName);
}
