// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ERC20Asset } from '@polkagate/apps-config/assets/evm/types.js';

import { createWsEndpoints, externalLinks } from '@polkagate/apps-config';
import { createAssets, createErc20Assets } from '@polkagate/apps-config/assets';
import { TokenETH } from '@web3icons/react';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { ETH_CHAINS_GENESISHASH, TOKEN_MAP } from './evmUtils/constantsEth';
import { sanitizeChainName } from './chain';
import getChainName from './getChainName';
import getNetworkMap from './getNetworkMap';
import { isMigratedHub, mapRelayToSystemGenesisIfMigrated, mapSystemToRelay } from './migrateHubUtils';
import { toCamelCase } from '.';

const endpoints = createWsEndpoints();

export interface LogoInfo {
  color?: string | undefined;
  logo?: string | undefined;
  logoSquare?: string | undefined;
  subLogo?: string;
}

/**
 * Generate a deterministic color from a string.
 * @param input - The string to base the color on (e.g., dataUri)
 * @returns A CSS color string in HSL format
 */
export function colorFromString(input: string): string {
  let hash = 0;

  // Simple hash function
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // convert to 32bit integer
  }

  // Map hash to hue [0-360]
  const hue = Math.abs(hash) % 360;

  return `hsl(${hue}, 100%, 50%)`;
}

function getEthereumLogos(lcInfo: string, token?: string): LogoInfo | undefined {
  const iconComponent =
    lcInfo === 'ethereum' || token === 'ETH'
      ? TokenETH
      : token
        ? (TOKEN_MAP[token.toUpperCase()] || TokenETH)
        : TokenETH;

  const svgString = ReactDOMServer.renderToStaticMarkup(
    React.createElement(iconComponent, { size: 40 })
  );
  const base64 = btoa(svgString);
  const dataUri = `data:image/svg+xml;base64,${base64}`;

  // Generate a color based on the dataUri
  const color = colorFromString(dataUri);

  return { color, logo: dataUri, logoSquare: dataUri };
}

const ETHChainsWithEthLogo = ['ethereum', 'sepolia', 'goerli'];
const erc20Assets = createErc20Assets() as ERC20Asset[];

function checkIfErc20(token?: string): LogoInfo | undefined {
  if (token) {
    return erc20Assets.find(({ symbol }) => symbol.toLowerCase() === token.toLowerCase())?.ui as LogoInfo | undefined;
  }

  return undefined;
}

function mayGetChainName(info: string | undefined | null): string | undefined {
  const networkMap = getNetworkMap();

  let chainNameFromGenesisHash = networkMap.get(info || '');

  if (!chainNameFromGenesisHash) {
    // check if info  is a chain name and exists. in the map
    const entry = Array.from(networkMap.entries())
      .find(([, value]) => value.toLowerCase() === (info || '').toLowerCase());

    chainNameFromGenesisHash = entry?.[1];
  }

  return chainNameFromGenesisHash;
}

function getTokenLogoOnMultiAssetChain(chainName: string | undefined, info: string | undefined, token: string): LogoInfo | undefined {
  const assets = createAssets(); // to fetch assets list from multi-asset chains
  const chainAssets = assets[toCamelCase(sanitizeChainName(chainName) || '')];
  const found = chainAssets?.find(({ symbol }) => symbol.toUpperCase() === token.toUpperCase())?.ui;
  const subLogo = found?.subLogo && !isMigratedHub(info)
    ? getLogo2(chainName)?.logo
    : undefined;

  if (found) {
    return { ...found, subLogo };
  }
}

function getTokenLogoOnSingleAssetChain(iconName: string | undefined): LogoInfo | undefined {
  const endpoint = endpoints.find((o) => o.info?.toLowerCase() === iconName);

  return iconName ? endpoint?.ui : undefined;
}

function getExternalLogo(iconName: string | undefined): LogoInfo | undefined {
  const maybeExternalLogo = Object
    .entries(externalLinks)
    .find(([name]): React.ReactNode | null =>
      name.toLowerCase() === iconName
    );

  return iconName ? maybeExternalLogo?.[1]?.ui : undefined;
}

export default function getLogo2(info: string | undefined | null, token?: string): LogoInfo | undefined {
  if (!info) {
    return checkIfErc20(token);
  }

  const lcInfo = info.toLowerCase();

  if (ETHChainsWithEthLogo.includes(lcInfo) || ETH_CHAINS_GENESISHASH.includes(info)) {
    return getEthereumLogos(lcInfo, token);
  }

  let chainNameFromGenesisHash;

  const _info = mapRelayToSystemGenesisIfMigrated(info);

  if (token) {
    chainNameFromGenesisHash = mayGetChainName(_info);

    if (!chainNameFromGenesisHash) {
      return undefined;
    }

    const multiAssetLogo = getTokenLogoOnMultiAssetChain(chainNameFromGenesisHash, _info, token);

    if (multiAssetLogo) {
      return multiAssetLogo;
    }

    const ERC20Logo = checkIfErc20(token);

    if (ERC20Logo) {
      return ERC20Logo;
    }

    const relayGenesis = mapSystemToRelay(info, false);

    if (relayGenesis && relayGenesis !== info) {
      chainNameFromGenesisHash = getChainName(relayGenesis);
    }
  }

  const chainName = chainNameFromGenesisHash || getChainName(_info) || _info;
  const iconName = sanitizeChainName(chainName)?.toLowerCase();

  const chainLogo = getTokenLogoOnSingleAssetChain(iconName);

  if (chainLogo) {
    return chainLogo;
  }

  return getExternalLogo(iconName);
}
