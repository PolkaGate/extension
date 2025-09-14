// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import type { DropdownOption } from '@polkadot/extension-polkagate/util/types';
import type { AnyNumber, ISubmittableResult } from '@polkadot/types/types';
import type { Bytes } from '@polkadot/types-codec';
import type { BN } from '@polkadot/util';

export interface Inputs {
  amount?: string | undefined;
  amountAsBN?: BN;
  assetId?: string | number;
  decimal?: number;
  fee?: BN;
  paraSpellTransaction?: SubmittableExtrinsic<'promise', ISubmittableResult>;
  transaction?: SubmittableExtrinsic<'promise', ISubmittableResult>;
  recipientAddress?: string | undefined;
  recipientChain?: DropdownOption | undefined; // NOTE: value cold be genesishash or para id!
  recipientGenesisHashOrParaId?: string | undefined;
  token?: string;
  feeInfo?: FeeInfo | undefined;
}

export interface FeeAssetInfo {
  deposit: BN;
  name: Bytes;
  symbol: Bytes;
  decimals: BN;
  isFrozen: boolean;
  id: BN;
  multiLocation: AnyNumber | object;
}

export interface FeeInfo {
  assetId?: object | AnyNumber;
  decimal: number | undefined;
  fee: BN | null | undefined;
  token: string | undefined;
}
