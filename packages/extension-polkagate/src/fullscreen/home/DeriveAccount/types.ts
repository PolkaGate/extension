// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export enum DERIVATION_STEPS {
  PARENT = 1,
  CHILD = 2,
}

interface AddressState {
  address: string;
}

export interface PathState extends AddressState {
  suri: string;
}