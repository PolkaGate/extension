// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TLocation, TXcmFeeBase, UnableToComputeError } from '@paraspell/sdk-pjs';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import type { DropdownOption } from '@polkadot/extension-polkagate/util/types';
import type { AnyNumber, ISubmittableResult } from '@polkadot/types/types';
import type { Bytes } from '@polkadot/types-codec';
import type { BN } from '@polkadot/util';

export interface ParaspellFees {
  originFee: TXcmFeeBase & { sufficient: boolean; balanceAfter: bigint; };
  destinationFee?: TXcmFeeBase & { balanceAfter: bigint | UnableToComputeError; };
}

export type TransferType = 'All' | 'Normal';

export interface Inputs {
  amount?: string | undefined;
  amountAsBN?: BN | undefined;
  assetId?: string | number;
  call?: SubmittableExtrinsic<'promise', ISubmittableResult>;
  decimal?: number;
  error?: string;
  fee?: ParaspellFees;
  feeInfo?: FeeInfo | undefined; // fee extra info
  isCrossChain?: boolean;
  tx?: SubmittableExtrinsic<'promise', ISubmittableResult>;
  recipientAddress?: string | undefined;
  recipientChain?: DropdownOption | undefined; // NOTE: value cold be genesishash or para id!
  recipientGenesisHashOrParaId?: string | undefined;
  token?: string;
  transferType?: TransferType
}

export interface FeeAssetInfo {
  deposit: BN;
  name: Bytes;
  symbol: Bytes;
  decimals: BN;
  isFrozen: boolean;
  id: BN;
  location: AnyNumber | object;
}

export interface FeeInfo {
  assetId?: object | AnyNumber;
  decimal: number | undefined;
  fee: BN | null | undefined;
  token: string | undefined;
  destinationFee?: {
    assetId: TLocation | undefined;
    decimal: number | undefined;
    fee: BN;
    token: string | undefined;
  }
}
