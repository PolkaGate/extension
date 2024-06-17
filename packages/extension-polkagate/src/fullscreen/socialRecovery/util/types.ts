// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import type { DeriveAccountInfo } from '@polkadot/api-derive/types';

import type { Balance } from '@polkadot/types/interfaces';
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
  redeemable: { amount: Balance, count: number };
  poolRedeemable: { amount: BN, count: number };
  soloStaked: BN;
  poolStaked: { amount: BN, hasRole: boolean };
  reserved: BN;
  hasId: boolean;
  hasProxy: boolean;
  soloUnlock: { amount: BN, date: number };
  poolUnlock: { amount: BN, date: number };
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

export interface SessionInfo {
  eraLength: number;
  eraProgress: number;
  currentEra: number;
};
