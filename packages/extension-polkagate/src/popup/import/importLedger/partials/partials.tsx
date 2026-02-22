// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { keyframes } from '@mui/material';
import { t } from 'i18next';

import { DISABLED_NETWORKS } from '../../../../util/constants';
import ledgerChains from '../../../../util/legerChains';

export interface NetworkOption {
  text: string;
  value: string | null;
}

export interface AccOption {
  text: string;
  value: number;
}

const AVAIL: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

export const accOps = AVAIL.map((value): AccOption => ({
  text: t('Account index {{index}}', { replace: { index: value } }),
  value
}));

export const addOps = AVAIL.map((value): AccOption => ({
  text: t('Address offset {{index}}', { replace: { index: value } }),
  value
}));

export const networkOps = [{
  text: t('No chain selected'),
  value: ''
},
...ledgerChains.filter(({ displayName }) => !DISABLED_NETWORKS.includes(displayName)).map(({ displayName, genesisHash }): NetworkOption => ({
  text: displayName,
  value: genesisHash[0]
}))];

export const showAddressAnimation = keyframes`
  0% {
    height: 0;
  }
  100% {
    height: 70px;
  }
`;

export const hideAddressAnimation = keyframes`
  0% {
    height: 70px;
  }
  100% {
    height: 0;
  }
`;

export const METADATA_DASHBOARD = 'https://dashboards.data.paritytech.io/metadata.html';
