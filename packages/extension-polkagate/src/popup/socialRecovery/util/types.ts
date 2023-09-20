// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { BN } from '@polkadot/util';

export type SocialRecoveryModes = 'RemoveRecovery' | 'SetRecovery' | 'ModifyRecovery' | 'InitiateRecovery' | 'CloseRecovery' | 'VouchRecovery' | 'Withdraw' | undefined;

export type RecoveryConfigType = {
  friends: { addresses: string[], infos?: (DeriveAccountInfo | undefined)[] | undefined };
  threshold: number;
  delayPeriod: number;
} | undefined;

export type WithdrawInfo = {
  rescuer: string;
  lost: string;
  claimed: boolean;
  isRecoverable: boolean;
  availableBalance: BN;
  redeemable: BN;
  soloStaked: BN;
  poolStaked: BN;
  reserved: BN;
  hasId: boolean;
  soloUnlock: { amount: BN, date: number };
} | undefined;

export type InitiateRecoveryConfig = {
  address: string;
  accountIdentity: DeriveAccountInfo | undefined;
  friends?: {
    addresses: string[];
    infos?: (DeriveAccountInfo | undefined)[] | undefined;
  };
  threshold?: number;
  delayPeriod?: string;
};
