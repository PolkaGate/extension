// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
import type { BN } from '@polkadot/util';
import type { PoolStakingInfo } from './usePoolStakingInfo';

import { useCallback, useMemo } from 'react';

import useChainInfo from './useChainInfo';
import useTranslation from './useTranslation';

export interface StatsSolo {
  value: number | BN | undefined;
  label: string;
  InfoIcon?: Icon;
  withLogo?: boolean;
}

interface Stats {
  value: number | string | BN | undefined;
  label: string;
  InfoIcon?: Icon;
  withLogo?: boolean;
}

export default function useStakingInfoPool(stakingInfo: PoolStakingInfo, genesisHash: string | undefined): Stats[] {
  const { t } = useTranslation();
  const { token } = useChainInfo(genesisHash, true);

  const getValue = useCallback((value: number | undefined) => {
    if (value === undefined) {
      return '-';
    }

    return value === -1
      ? t('unlimited')
      : value;
  }, [t]);

  return useMemo(() => {
    const { lastPoolId, maxPoolMembers, maxPoolMembersPerPool, maxPools, minCreationBond, minJoinBond } = stakingInfo.poolStakingConsts || {};

    return [
      { label: t('Min {{token}} to join a pool', { replace: { token: token ?? '' } }), value: minJoinBond },
      { label: t('Min {{token}} to create a pool', { replace: { token: token ?? '' } }), value: minCreationBond },
      { label: t('Number of existing pools'), value: lastPoolId?.toString() },
      { label: t('Max possible pools'), value: getValue(maxPools) },
      { label: t('Max possible pool members'), value: getValue(maxPoolMembers) },
      { label: t('Max pool members per pool'), value: getValue(maxPoolMembersPerPool) }
    ];
  }
    , [getValue, stakingInfo.poolStakingConsts, t, token]);
}
