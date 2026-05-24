// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface AccountInfo {
  address: string;
  genesis?: string;
  suri: string;
}

export enum STEP {
  SEED,
  DETAIL
}
