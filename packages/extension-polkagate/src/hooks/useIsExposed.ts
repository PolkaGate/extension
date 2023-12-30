// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { useApi, useChain, useCurrentEraIndex, useStakingConsts, useStashId } from '.';

export default function useIsExposed(address: AccountId | string | undefined): boolean | undefined {
  const api = useApi(address);
  const stashId = useStashId(address);
  const chain = useChain(address);
  const currentEraIndex = useCurrentEraIndex(address);
  const stakingConsts = useStakingConsts(address);
  const [exposed, setIsExposed] = useState<boolean>();

  const checkIsExposed = useCallback(async (stashId: AccountId | string): Promise<undefined> => {
    const erasToCheck = api ? (await api.query.fastUnstake.erasToCheckPerBlock()).toNumber() as number : undefined;

    if (!erasToCheck || !stakingConsts || !api || !currentEraIndex) {
      setIsExposed(undefined);

      return;
    }

    const isErasStakersPaged = !!api.query.staking?.erasStakersPaged;
    const eraStakes = isErasStakersPaged ? api.query.staking.erasStakersPaged : api.query.staking.erasStakers;
    const tasks = Array.from({ length: stakingConsts.bondingDuration }, (_, index) => eraStakes.entries(currentEraIndex - index));
    const erasStakers = await Promise.all(tasks);

    setIsExposed(!!erasStakers.flat().map((v) => isErasStakersPaged ? v[1].unwrap().others : v[1].others).flat().find(({ who }) => String(who) === stashId));
  }, [api, currentEraIndex, stakingConsts]);

  useEffect(() => {
    api &&
      api.genesisHash.toString() === chain?.genesisHash &&
      stashId && api.query?.fastUnstake && currentEraIndex && stakingConsts?.bondingDuration &&
      checkIsExposed(stashId);
  }, [api, chain, checkIsExposed, currentEraIndex, stashId, stakingConsts]);

  return exposed;
}
