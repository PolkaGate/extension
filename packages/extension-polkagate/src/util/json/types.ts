// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

interface Asset {
  assetId: number;
  symbol: string;
  decimal: number;
  priceId?: string;
  assetName: string;
  isNative?: boolean;
  type?: string;
  typeExtras?: {
    assetId: string;
  };
}

interface Config {
  genesishash: string;
  assets: Asset[];
}

export interface ChainConfigs {
  version: string;
  [chainName: string]: Config;
}
