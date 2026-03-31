// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { LogoInfo, ResolveLogoInfoOptions } from './types';

import { sanitizeChainName } from '../chain';
import { ETH_CHAINS_GENESISHASH } from '../evmUtils/constantsEth';
import getChainName from '../getChainName';
import { mapRelayToSystemGenesisIfMigrated, mapSystemToRelay } from '../migrateHubUtils';
import { toCamelCase } from '..';
import { resolveChainLogoInfo } from './chain';
import { erc20Assets, ETHChainsWithEthLogo, substrateAssets } from './constants';
import { getEthereumLogos } from './ethereum';
import { mayGetChainName } from './helpers';

function checkIfErc20(token?: string): LogoInfo | undefined {
  if (token) {
    return erc20Assets.find(({ symbol }) => symbol.toLowerCase() === token.toLowerCase())?.ui as LogoInfo | undefined;
  }

  return undefined;
}

function getTokenOnlyLogo(token?: string): LogoInfo | undefined {
  return checkIfErc20(token);
}

function getTokenLogoOnMultiAssetChain(chainName: string | undefined, info: string | undefined, token: string): LogoInfo | undefined {
  const sanitizedChainName = sanitizeChainName(chainName) || '';
  const relayGenesis = mapSystemToRelay(info, false);
  const relayChainName = relayGenesis ? getChainName(relayGenesis) : undefined;
  const candidateChainKeys = [
    toCamelCase(sanitizedChainName),
    toCamelCase(`${sanitizedChainName}AssetHub`),
    toCamelCase(relayChainName || ''),
    toCamelCase(`${relayChainName || ''}AssetHub`)
  ].filter(Boolean);
  const found = candidateChainKeys
    .flatMap((chainKey) => substrateAssets[chainKey] || [])
    .find(({ symbol }) => symbol.toUpperCase() === token.toUpperCase())?.ui;
  const relayChainLogo = resolveChainLogoInfo(relayGenesis)?.logo;
  const currentChainLogo = resolveChainLogoInfo(info)?.logo || resolveChainLogoInfo(chainName)?.logo;
  const isPeopleChain = sanitizeChainName(chainName)?.toLowerCase().includes('people') || sanitizeChainName(info)?.toLowerCase().includes('people');
  const subLogo = found?.subLogo
    ? isPeopleChain
      ? currentChainLogo || relayChainLogo
      : relayChainLogo || currentChainLogo
    : undefined;

  return found ? (subLogo ? { ...found, subLogo } : found as LogoInfo) : undefined;
}

export function resolveTokenLogoInfo(
  info: string | undefined | null,
  token: string | undefined,
  options?: ResolveLogoInfoOptions
): LogoInfo | undefined {
  if (options?.externalLogo) {
    return options.externalLogo;
  }

  if (!token) {
    return resolveChainLogoInfo(info, options);
  }

  const normalizedInfo = typeof info === 'string' ? info : undefined;

  if (!normalizedInfo) {
    return getTokenOnlyLogo(token);
  }

  const lcInfo = normalizedInfo.toLowerCase();

  if (ETHChainsWithEthLogo.includes(lcInfo) || ETH_CHAINS_GENESISHASH.includes(normalizedInfo)) {
    return getEthereumLogos(lcInfo, token);
  }

  const resolvedInfo = mapRelayToSystemGenesisIfMigrated(normalizedInfo);
  let chainNameFromGenesisHash = mayGetChainName(resolvedInfo);
  const directChainName = getChainName(normalizedInfo) || normalizedInfo;
  const multiAssetLogo = getTokenLogoOnMultiAssetChain(chainNameFromGenesisHash || directChainName, resolvedInfo, token);

  if (multiAssetLogo) {
    return multiAssetLogo;
  }

  if (chainNameFromGenesisHash) {
    const relayGenesis = mapSystemToRelay(normalizedInfo, false);

    if (relayGenesis && relayGenesis !== normalizedInfo) {
      chainNameFromGenesisHash = getChainName(relayGenesis);
    }
  }

  return getTokenOnlyLogo(token) || resolveChainLogoInfo(chainNameFromGenesisHash || normalizedInfo, options);
}
