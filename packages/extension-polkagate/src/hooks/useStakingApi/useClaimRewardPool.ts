// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Content } from '../../partials/Review';

import { useMemo } from 'react';

import { isHexToBn } from '../../util';
import useChainInfo from '../useChainInfo';
import useEstimatedFee from '../useEstimatedFee';
import useFormatted from '../useFormatted';
import usePoolStakingInfo from '../usePoolStakingInfo';
import useTranslation from '../useTranslation';

export const useClaimRewardPool = (
  address: string | undefined,
  genesisHash: string | undefined,
  restake: boolean
) => {
  const { t } = useTranslation();

  const formatted = useFormatted(address, genesisHash);
  const { api } = useChainInfo(genesisHash);
  const stakingInfo = usePoolStakingInfo(address, genesisHash);

  const claimPayout = api?.tx['nominationPools']['claimPayout'];
  const bondExtra = api?.tx['nominationPools']['bondExtra'];

  const myClaimable = useMemo(() => stakingInfo.pool === undefined ? undefined : isHexToBn(stakingInfo.pool?.myClaimable as string | undefined ?? '0'), [stakingInfo.pool]);

  const tx = useMemo(() => {
    if (!restake && claimPayout) {
      return claimPayout();
    }

    if (restake && bondExtra && myClaimable) {
      return bondExtra({ Rewards: myClaimable });
    }

    return undefined;
  }, [bondExtra, claimPayout, myClaimable, restake]);

  const estimatedFee = useEstimatedFee(genesisHash, formatted, tx);

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: address,
      title: t('Account')
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    }];
  }, [t, address, estimatedFee]);

  return {
    myClaimable,
    transactionInformation,
    tx
  };
};
