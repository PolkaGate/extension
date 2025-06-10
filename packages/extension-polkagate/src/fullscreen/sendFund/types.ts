// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import type { DropdownOption } from '@polkadot/extension-polkagate/util/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';

export interface Inputs {
  amount?: string | undefined;
  amountAsBN?: BN;
  decimal?: number;
  fee?: BN;
  paraSpellFee?: BN;
  paraSpellTransaction?: SubmittableExtrinsic<'promise', ISubmittableResult>;
  transaction?: SubmittableExtrinsic<'promise', ISubmittableResult>;
  recipientAddress?: string | undefined;
  recipientChain?: DropdownOption | undefined;
  recipientGenesisHashOrParaId?: string | undefined;
  token?: string;
}
