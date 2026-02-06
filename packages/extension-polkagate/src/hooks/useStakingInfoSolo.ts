// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
import type { BN } from '@polkadot/util';
import type { SoloStakingInfo } from './useSoloStakingInfo';

import { Calendar, Discover, MagicStar } from 'iconsax-react';
import { useMemo } from 'react';

import { bnMax } from '@polkadot/util';

import useChainInfo from './useChainInfo';
import useMinToReceiveRewardsInSolo from './useMinToReceiveRewardsInSolo';
import useTranslation from './useTranslation';

export interface StatsSolo {
  value: number | BN | undefined;
  label: string;
  InfoIcon?: Icon;
  withLogo?: boolean;
}

export default function useStakingInfoSolo(stakingInfo: SoloStakingInfo, genesisHash: string | undefined): StatsSolo[] {
  const { t } = useTranslation();
  const { token } = useChainInfo(genesisHash, true);

  const minimumActiveStake = useMinToReceiveRewardsInSolo(genesisHash);

  return useMemo(() => {
    const { existentialDeposit, maxNominations, maxNominatorRewardedPerValidator, minNominatorBond, unbondingDuration } = stakingInfo.stakingConsts || {};

    return [
      { InfoIcon: Discover, label: t('Max Validators you can select'), value: maxNominations },
      { label: t('Min {{token}} to be staker', { replace: { token: token ?? '' } }), value: minNominatorBond, withLogo: true },
      { label: t('Min {{token}} to receive rewards', { replace: { token: token ?? '' } }), value: minimumActiveStake && minNominatorBond && bnMax(minNominatorBond, minimumActiveStake), withLogo: true },
      { InfoIcon: MagicStar, label: t('Max nominators of a validator, who may receive rewards'), value: maxNominatorRewardedPerValidator },
      { InfoIcon: Calendar, label: t('Days it takes to receive your funds back after unstaking'), value: unbondingDuration },
      { label: t('Min {{token}} that must remain in your account (ED)', { replace: { token: token ?? '' } }), value: existentialDeposit, withLogo: true }
    ];
  }
    , [minimumActiveStake, stakingInfo.stakingConsts, t, token]);
}
