// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubstrateNetwork } from '@polkadot/networks/types';

import { selectableNetworks } from '@polkagate/apps-config';

export default (selectableNetworks as SubstrateNetwork[]).filter((network) => network.hasLedgerSupport);
