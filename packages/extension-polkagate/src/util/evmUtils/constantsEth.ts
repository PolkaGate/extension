// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';

import { TokenETH, TokenUSDC, TokenUSDT } from '@web3icons/react';

export const ETHEREUM_GENESISHASH = '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3';
const GORELI_GENESISHASH = '0x5fbe6b8f0e9b91f8c5c88ee6f7a3b7f7d05c1e71f6e4c4c1c6e8c123456789ab';
const SEPOLIA_GENESISHASH = '0x25a5cc106eea7138acab33231d7160d69cb777ee0c2c553fcddf5138993e6dd9';

export const EVM_GENESISHASH_MAP: Record<string, string> = {
  ethereum: ETHEREUM_GENESISHASH,
  goreli: GORELI_GENESISHASH,
  sepolia: SEPOLIA_GENESISHASH
};

export const ETHEREUM_TEST_CHAINS_GENESISHASH = [
  GORELI_GENESISHASH,
  SEPOLIA_GENESISHASH
];

export const EVM_CHAINS_GENESISHASH = [
  ETHEREUM_GENESISHASH,
  ...ETHEREUM_TEST_CHAINS_GENESISHASH
];

export const TOKEN_MAP: Record<string, React.ComponentType<{ size: number }>> = {
  ETH: TokenETH,
  USDC: TokenUSDC,
  USDT: TokenUSDT
};

export const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)'
];

interface TokenInfo {
  contract: string;
  icon: React.ComponentType<any>;
  priceId: string;
}

type ERC20_TOKENS_TYPE = Record<string, Record<string, TokenInfo>>;

export const ERC20_TOKENS: ERC20_TOKENS_TYPE = {
  ethereum: {
    USDC: {
      contract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      icon: TokenUSDC,
      priceId: 'usd-coin'
    },
    USDT: {
      contract: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      icon: TokenUSDT,
      priceId: 'tether'
    }
  },
  goerli: {
    USDC: {
      contract: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
      icon: TokenUSDC,
      priceId: ''
    }
  }
};
