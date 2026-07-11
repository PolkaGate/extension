// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import useChainInfo from './useChainInfo';
import useFormatted from './useFormatted';

export default function useIsValidator(address: string | undefined, genesisHash: string | null | undefined): boolean | undefined {
  const { api } = useChainInfo(genesisHash);
  const formatted = useFormatted(address, genesisHash);

  const [isValidator, setIsValidator] = useState<boolean>();

  useEffect(() => {
    if (!api || !formatted) {
      return;
    }

    let active = true;

    api.query['staking']['validators'](formatted).then((prefs: { isStorageFallback?: boolean }) => {
      if (active) {
        setIsValidator(!prefs.isStorageFallback);
      }
    }).catch(console.error);

    return () => { active = false; };
  }, [api, formatted]);

  return isValidator;
}
