// Copyright 2022-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

export interface DropdownOption {
  key?: string;
  text: React.ReactNode | string;
  value: string;
}

export default function sectionOptions (api: ApiPromise, filter?: (section: string, method?: string) => boolean): DropdownOption[] {
  return Object
    .keys(api.tx)
    .filter((s) =>
      !s.startsWith('$') &&
            (!filter || filter(s))
    )
    .sort()
    .filter((name): number => Object.keys(api.tx[name]).length)
    .map((name): { text: string; value: string } => ({
      text: name,
      value: name
    }));
}
