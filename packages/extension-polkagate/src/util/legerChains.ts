// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import { selectableNetworks } from '@polkadot/networks';

export default selectableNetworks.filter((network) => network.hasLedgerSupport);
