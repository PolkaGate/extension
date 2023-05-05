// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { useApi } from '.';

export default function usePreImageHashes(address: string | undefined): string[] | undefined {
  const [hashes, setHashes] = useState<string[] | undefined>();
  const api = useApi(address);

  useEffect(() => {
    api && api.query.preimage.preimageFor.keys().then((keys) => {
      const hashes = keys.map(({ args: [hash] }) => hash);

      setHashes(hashes.map((h) => h.toHex()));
    });
  }, [api]);

  return hashes;
}
