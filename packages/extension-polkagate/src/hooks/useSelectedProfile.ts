// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext } from 'react';

import { SelectedContext } from '../components';

export default function useSelectedProfile (): string | undefined | null {
  const { selected: { profile } } = useContext(SelectedContext);

  return profile;
}
