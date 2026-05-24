// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { STEPS } from './consts';

export type ProxyFlowStep = typeof STEPS[keyof typeof STEPS];
