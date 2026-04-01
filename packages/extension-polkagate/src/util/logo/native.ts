// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { assetsDotSVG, assetsKsmSVG, assetsPasSVG, assetsWndSVG } from '@polkagate/apps-config/ui/logos/assets/index.js';

const NATIVE_TOKEN_LOGO_BY_SYMBOL: Record<string, string> = {
  DOT: assetsDotSVG,
  KSM: assetsKsmSVG,
  PAS: assetsPasSVG,
  WND: assetsWndSVG
};

export function getNativeTokenLogo(symbol?: string): string | undefined {
  return symbol ? NATIVE_TOKEN_LOGO_BY_SYMBOL[symbol.toUpperCase()] : undefined;
}
