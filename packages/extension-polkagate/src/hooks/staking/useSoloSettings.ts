// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Content } from '../../partials/Review';
import type { RewardDestinationType } from '../../util/types';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useChainInfo from '../useChainInfo';
import useEstimatedFee2 from '../useEstimatedFee2';
import useFormatted3 from '../useFormatted3';
import useSoloStakingInfo from '../useSoloStakingInfo';

const useSoloSettings = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();

  const stakingInfo = useSoloStakingInfo(address, genesisHash);
  const { api } = useChainInfo(genesisHash);
  const formatted = useFormatted3(address, genesisHash);

  const setPayee = api?.tx['staking']['setPayee'];

  const stashId = stakingInfo.stakingAccount?.stashId.toString() ?? formatted ?? address;
  const rewardDestinationAddress = stakingInfo.rewardDestinationAddress;
  const ED = stakingInfo.stakingConsts?.existentialDeposit;

  const [rewardDestinationType, setRewardDestinationType] = useState<RewardDestinationType>(undefined);
  const [specificAccount, setSpecificAccount] = useState<string | undefined>(undefined);

  const rewardType = useMemo(() => {
    if (!stakingInfo.stakingAccount) {
      return undefined;
    }

    // initialize settings
    const parsedStakingAccount = stakingInfo.stakingAccount;

    /** in Westend it is null recently if user has not staked yet */
    if (!parsedStakingAccount.rewardDestination) {
      return undefined;
    }

    const destinationType = Object.keys(parsedStakingAccount.rewardDestination)[0];

    if (destinationType === 'Staked') {
      return 'Staked';
    } else {
      return 'Others';
    }
  }, [stakingInfo.stakingAccount]);

  useEffect(() => {
    if (!stakingInfo.stakingAccount) {
      return;
    }

    setRewardDestinationType(rewardType);
  }, [rewardType, stakingInfo.stakingAccount]);

  const makePayee = useCallback((value: RewardDestinationType, account: string | undefined) => {
    if (!value) {
      return;
    }

    if (value === 'Staked') {
      return 'Staked';
    }

    if (account === stashId) {
      return 'Stash';
    }

    if (account) {
      return { Account: account };
    }

    return undefined;
  }, [stashId]);

  const rewardDestination = useMemo(() => makePayee(rewardDestinationType, specificAccount ?? rewardDestinationAddress ?? stashId), [makePayee, rewardDestinationAddress, rewardDestinationType, specificAccount, stashId]);

  const estimatedFee = useEstimatedFee2(genesisHash ?? '', formatted, setPayee, [rewardDestination ?? 'Staked']);
  const changeToStake = useMemo(() => rewardType === 'Others' && rewardDestinationType === 'Staked', [rewardDestinationType, rewardType]);
  const nextDisabled = useMemo(() => rewardDestinationType === 'Others' && (rewardDestinationAddress === specificAccount || !specificAccount), [rewardDestinationAddress, rewardDestinationType, specificAccount]);

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: rewardDestinationType === 'Others' ? (specificAccount ?? rewardDestinationAddress ?? stashId) : 'Staked',
      title: t('Reward destination')
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    }];
  }, [estimatedFee, rewardDestinationAddress, rewardDestinationType, specificAccount, stashId, t]);
  const tx = useMemo(() => {
    return rewardDestination && setPayee
      ? setPayee(rewardDestination)
      : undefined;
  }, [rewardDestination, setPayee]);

  return {
    ED,
    changeToStake,
    nextDisabled,
    rewardDestinationAddress,
    rewardDestinationType,
    setRewardDestinationType,
    setSpecificAccount,
    specificAccount,
    transactionInformation,
    tx
  };
};

export default useSoloSettings;
