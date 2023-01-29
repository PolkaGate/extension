// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { useApi, useChain, useCurrentEraIndex, useFormatted, useStakingConsts } from '.';

export default function useIsExposed(address: AccountId | string | undefined): boolean | undefined {
  const api = useApi(address);
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const currentEraIndex = useCurrentEraIndex(address);
  const stakingConsts = useStakingConsts(address);
  const [exposed, setIsExposed] = useState<boolean>();

  const checkIsExposed = useCallback(async (formatted: AccountId | string): Promise<undefined> => {
    const erasToCheck = (await api.query.fastUnstake.erasToCheckPerBlock()).toNumber() as number;

    if (!erasToCheck) {
      setIsExposed(true); // TODO: double check

      return;
    }

    const erasStakers = await Promise.all(
      [...Array(stakingConsts.bondingDuration)].map((_, i) =>
        api.query.staking.erasStakers.entries(currentEraIndex - i)
      )
    );

    setIsExposed(!!erasStakers.flat().map((x) => x[1].others).flat().find((x) => String(x.who) === formatted));
  }, [api, currentEraIndex, stakingConsts?.bondingDuration]);

  useEffect(() => {
    api && api.genesisHash.toString() === chain?.genesisHash && formatted && api.query?.fastUnstake && currentEraIndex && stakingConsts?.bondingDuration && checkIsExposed(formatted);
  }, [api, chain, checkIsExposed, currentEraIndex, formatted, stakingConsts]);

  return exposed;
}
