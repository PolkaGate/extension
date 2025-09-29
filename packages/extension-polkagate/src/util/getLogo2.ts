// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createWsEndpoints, externalLinks } from '@polkagate/apps-config';
import { createAssets } from '@polkagate/apps-config/assets';
import { TokenETH } from '@web3icons/react';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { sanitizeChainName } from './chain';
import { EVM_CHAINS_GENESISHASH, TOKEN_MAP } from './evmUtils/constantsEth';
import getChainName from './getChainName';
import getNetworkMap from './getNetworkMap';
import { isMigratedHub, mapRelayToSystemGenesisIfMigrated, mapSystemToRelay } from './migrateHubUtils';
import { toCamelCase } from '.';

const endpoints = createWsEndpoints();

export interface LogoInfo {
  logo?: string | undefined;
  logoSquare?: string | undefined;
  color?: string | undefined;
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

const evmChainsWithEthLogo = ['ethereum', 'sepolia', 'goerli'];

export default function getLogo2(info: string | undefined | null, token?: string): LogoInfo | undefined {
  if (!info) {
    return;
  }

  const lcInfo = info.toLowerCase();

  if (evmChainsWithEthLogo.includes(lcInfo) || EVM_CHAINS_GENESISHASH.includes(info)) {
    return getEthereumLogos(lcInfo, token);
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
