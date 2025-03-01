// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { useInfo } from '.';

/**
 * @description this hook checks if the address is a validator or not
 */

export default function useIsValidator(address: string | undefined): boolean | null | undefined {
  const { api, formatted } = useInfo(address);

  const [isValidator, setIsValidator] = useState<boolean | null>();

  useEffect(() => {
    if (!formatted || !api) {
      return;
    }

    const getValidators = async () => {
      if (!api) {
        return; // never happens since we check api before, but to suppress linting
      }

      const prefs = await api.query['staking']['validators'].entries();

      const validators: string[] = prefs.map(([key, _]) => (key.toHuman() as any[])?.[0] as string);

      const found = validators.find((v) => v === formatted);

      setIsValidator(!!found);
    };

    getValidators().catch(console.error);
  }, [api, formatted]);

  return isValidator;
}
