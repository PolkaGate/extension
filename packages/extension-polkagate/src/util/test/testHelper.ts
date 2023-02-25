// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { selectableNetworks } from '@polkadot/networks';

export const kusamaAddress = 'Cgp9bcq1dGP1Z9B6F2ccTSTHNez9jq2iUX993ZbDVByPSU2';
export const polkadotAddress = '17VdcY2F3WvhSLFHBGZreubzQNQ3NZzLbQsugGzHmzzprSG';

export const kusamaGenesisHash = '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe';
export const polkadotGenesisHash = '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3';
export const westendGenesisHash = '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e';

export const getDecimal = (genesisHash: string) => {
  const network = selectableNetworks.find((network) => network.genesisHash[0] === genesisHash);

  return network?.decimals?.length ? network.decimals[0] : undefined;
};

export const getToken = (genesisHash: string) => {
  const network = selectableNetworks.find((network) => network.genesisHash[0] === genesisHash);

  return network?.symbols?.length ? network.symbols[0] : undefined;
};
