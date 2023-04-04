// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { chainLogos, emptyLogos, externalLogos, namedLogos, nodeLogos, specLogos } from '@polkadot/apps-config';

import { Chain } from '../../../extension-chains/src/types';

function sanitize(value?: string): string {
  return value?.toLowerCase().replace('-', ' ') || '';
}

export default function getLogo(info: string | undefined | Chain): string {
  // const specName= api.runtimeVersion.specName.toString();
  // getSystemIcon(systemName, specName)

  const name = (info as Chain)?.name?.replace(' Relay Chain', '')?.replace(' Network', '').toLowerCase() ?? (info as string)?.toLowerCase();
  const found = name ? (namedLogos[name] || chainLogos[sanitize(name)] || nodeLogos[sanitize(name)] || specLogos[sanitize(name)] || externalLogos[sanitize(name)]) : undefined;

  // return (found || emptyLogos.empty) as string;
  return found as string;
}
