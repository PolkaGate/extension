// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { useApi } from '../../hooks';

export default function useProxyTypes(genesisHash: string | undefined): string[] {
  const api = useApi(genesisHash);

  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.rpc.state.getMetadata().then((metadata) => {
      const lookup = metadata.asLatest.lookup;
      const proxyTypeEntry = lookup.types.find((t) => t.type.path.some((p) => p.toString() === 'ProxyType'));

      if (proxyTypeEntry) {
        const variants = proxyTypeEntry.type.def.asVariant.variants;
        const types = variants.map((v) => v.name.toString());

        setTypes(types);
      }
    }).catch(console.error);
  }, [api]);

  return types;
}
