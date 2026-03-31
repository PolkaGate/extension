// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ERC20Asset } from '@polkagate/apps-config/assets/evm/types.js';

import { createWsEndpoints } from '@polkagate/apps-config';
import { createAssets, createErc20Assets } from '@polkagate/apps-config/assets';

export const endpoints = createWsEndpoints();
export const ETHChainsWithEthLogo = ['ethereum', 'sepolia', 'goerli'];
export const substrateAssets = createAssets();
export const erc20Assets = createErc20Assets() as ERC20Asset[];
