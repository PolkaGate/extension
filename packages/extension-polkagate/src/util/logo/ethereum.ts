// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { LogoInfo } from './types';

import { TokenETH } from '@web3icons/react';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { TOKEN_MAP } from '../evmUtils/constantsEth';
import { colorFromString } from './helpers';

export function getEthereumLogos(lcInfo: string, token?: string): LogoInfo | undefined {
  const iconComponent =
    lcInfo === 'ethereum' || token === 'ETH'
      ? TokenETH
      : token
        ? (TOKEN_MAP[token.toUpperCase()] || TokenETH)
        : TokenETH;

  const svgString = ReactDOMServer.renderToStaticMarkup(
    React.createElement(iconComponent, { size: 40 })
  );
  const dataUri = `data:image/svg+xml;base64,${btoa(svgString)}`;

  return { color: colorFromString(dataUri), logo: dataUri, logoSquare: dataUri };
}
