// Copyright 2022-2023 @polkadot/polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

export interface DropdownOption {
  className?: string;
  key?: string;
  text: React.ReactNode;
  value: string;
}

export type DropdownOptions = DropdownOption[];

export default function sectionOptions (api: ApiPromise, filter?: (section: string, method?: string) => boolean): DropdownOptions {
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
