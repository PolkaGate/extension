// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Content } from '../../partials/Review';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { isHexToBn } from '../../util/utils';
import useChainInfo from '../useChainInfo';
import useEstimatedFee2 from '../useEstimatedFee2';
import useFormatted3 from '../useFormatted3';
import usePoolStakingInfo from '../usePoolStakingInfo';

const useClaimRewardPool = (
  address: string | undefined,
  genesisHash: string | undefined,
  restake: boolean
) => {
  const { t } = useTranslation();

  const formatted = useFormatted3(address, genesisHash);
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

  const estimatedFee = useEstimatedFee2(genesisHash, formatted, tx);

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

export default useClaimRewardPool;
