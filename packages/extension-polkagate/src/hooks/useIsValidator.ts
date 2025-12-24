// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import useChainInfo from './useChainInfo';
import useFormatted from './useFormatted';

export default function useIsValidator (address: string | undefined, genesisHash: string | null | undefined): boolean | undefined {
  const { api } = useChainInfo(genesisHash);
  const formatted = useFormatted(address, genesisHash);

  const [isValidator, setIsValidator] = useState<boolean>();

  useEffect(() => {
    if (!api || !address) {
      return;
    }

    api.query['staking']['validators'].keys().then((intentions) => {
      const isValidator = intentions
        .map(({ args }: { args: any[] }) => args[0].toString())
        .includes(formatted);

      setIsValidator(isValidator);
    }).catch(console.error);
  }, [address, api, formatted]);

  return isValidator;
}
