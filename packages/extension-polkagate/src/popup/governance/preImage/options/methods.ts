// Copyright 2022-2023 @polkadot/polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { DropdownOption, DropdownOptions } from './section.js';

export default function methodOptions (api: ApiPromise, sectionName: string, filter?: (section: string, method?: string) => boolean): DropdownOptions {
  const section = api.tx[sectionName];
  const isAllowed = !filter || filter(sectionName);

  if (!section || Object.keys(section).length === 0 || !isAllowed) {
    return [];
  }

  return Object
    .keys(section)
    .filter((s) =>
      !s.startsWith('$') &&
      (!filter || filter(sectionName, s))
    )
    .sort()
    .map((value): DropdownOption => {
      const method = section[value];
      const inputs = method.meta.args
        .map((arg) => arg.name.toString())
        .join(', ');

      return {
        className: 'ui--DropdownLinked-Item',
        key: `${sectionName}_${value}`,
        text: [`${value}(${inputs}) ${(method.meta.docs[0] || value).toString()}`
        ],
        value
      };
    });
}