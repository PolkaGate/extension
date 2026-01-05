// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { useContext } from 'react';

import { SelectedContext } from '../components';

export default function useSelectedAccount (): AccountJson | null | undefined {
  const { selected: { account } } = useContext(SelectedContext);

  return account;
}
