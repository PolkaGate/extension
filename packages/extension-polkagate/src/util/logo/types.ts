// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface LogoInfo {
  color?: string | undefined;
  logo?: string | undefined;
  logoSquare?: string | undefined;
  subLogo?: string;
}

export interface ResolveLogoInfoOptions {
  externalLogo?: LogoInfo | undefined;
}
