// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { ProxyTypes } from '@polkadot/extension-polkagate/util/types';

import { Chart2, CloseCircle, Data2, HierarchySquare2, Judge, People, Profile2User, Setting2, ShieldTick, Slash, UserSquare, Wallet2 } from 'iconsax-react';

import { TRANSACTION_FLOW_STEPS } from '@polkadot/extension-polkagate/src/util/constants';

export const STEPS = {
  ...TRANSACTION_FLOW_STEPS,
  ADD_PROXY: 'add_proxy',
  INIT: 'init',
  SIGN_QR: 'sign_QR',
  UNSUPPORTED: 'unsupported'
};

export const PROXY_ICONS: Record<ProxyTypes, React.ElementType> = {
  Any: Data2,
  AssetManager: Setting2,
  AssetOwner: Profile2User,
  Assets: Wallet2,
  Auction: HierarchySquare2,
  CancelProxy: CloseCircle,
  Collator: UserSquare,
  Governance: Judge,
  IdentityJudgement: ShieldTick,
  NominationPools: People,
  NonTransfer: Slash,
  Society: Profile2User,
  Staking: Chart2,
  SudoBalances: Setting2
};
