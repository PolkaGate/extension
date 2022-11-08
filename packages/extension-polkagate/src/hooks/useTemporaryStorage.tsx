// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext } from 'react';

import { TemporaryStorage } from '../components/contexts';

export default function useTemporaryStorage(): { value: string, setValue: (message: any) => void } {
  return useContext(TemporaryStorage);
}
