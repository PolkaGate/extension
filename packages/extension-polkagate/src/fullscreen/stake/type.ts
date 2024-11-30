// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { AnyTuple } from '@polkadot/types/types';
import type { MyPoolInfo, Payee, ValidatorInfo } from '../../util/types';

export interface StakingInputs {
  amount?: string | undefined; // deprecated, moved to extraInfo
  call: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined;
  mode?: number;
  payee?: Payee;
  params: unknown[] | (() => unknown)[];
  pool?: MyPoolInfo,
  estimatedFee?: Balance;
  selectedValidators?: ValidatorInfo[],
  extraInfo?: Record<string, any>
}
