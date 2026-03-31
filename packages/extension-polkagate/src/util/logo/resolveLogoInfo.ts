// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { LogoInfo, ResolveLogoInfoOptions } from './types';

import { resolveChainLogoInfo } from './chain';
import { resolveTokenLogoInfo } from './token';

export { resolveTokenLogoInfo } from './token';
export type { LogoInfo } from './types';

export default function resolveLogoInfo(
  info: string | undefined | null,
  token?: string,
  options?: ResolveLogoInfoOptions
): LogoInfo | undefined {
  if (token) {
    return resolveTokenLogoInfo(info, token, options);
  }

  return resolveChainLogoInfo(info, options);
}
