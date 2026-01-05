// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { SoloStakingInfo } from './useSoloStakingInfo';

import { useCallback, useEffect, useState } from 'react';

import useChainInfo from './useChainInfo';
import useCurrentEraIndex from './useCurrentEraIndex';

export default function useIsExposed (genesisHash: string | undefined, stakingInfo: SoloStakingInfo): boolean | undefined {
  const { api, chain } = useChainInfo(genesisHash);
  const currentEraIndex = useCurrentEraIndex(genesisHash);
  const [exposed, setIsExposed] = useState<boolean>();

  const checkIsExposed = useCallback(async (stashId: AccountId | string): Promise<undefined> => {
    if (!api || !chain) {
      setIsExposed(undefined);

      return;
    }

    if (!stakingInfo.stakingConsts || !api || !currentEraIndex) {
      setIsExposed(undefined);

      return;
    }

    const isErasStakersPaged = !!api.query['staking']?.['erasStakersPaged'];
    const eraStakes = isErasStakersPaged ? api.query['staking']['erasStakersPaged'] : api.query['staking']['erasStakers'];
    const tasks = Array.from({ length: stakingInfo.stakingConsts.bondingDuration }, (_, index) => eraStakes.entries(currentEraIndex - index));

    for (const element of tasks) {
      const result = await element;

      // @ts-ignore
      const exposed = result.map((v) => isErasStakersPaged ? v[1].unwrap().others : v[1].others).flat().find(({ who }) => String(who) === stashId);

      if (exposed) {
        setIsExposed(true);

        return;
      }
    }

    setIsExposed(false);
  }, [api, chain, currentEraIndex, stakingInfo.stakingConsts]);

  useEffect(() => {
    if (!api || api.genesisHash.toString() !== chain?.genesisHash || !stakingInfo.stakingAccount?.stashId || !api.query?.['fastUnstake'] || !currentEraIndex || !stakingInfo.stakingConsts?.bondingDuration) {
      return;
    }

    checkIsExposed(stakingInfo.stakingAccount.stashId.toString()).catch(console.error);
  }, [api, chain?.genesisHash, checkIsExposed, currentEraIndex, stakingInfo.stakingAccount?.stashId, stakingInfo.stakingConsts?.bondingDuration]);

  return exposed;
}
