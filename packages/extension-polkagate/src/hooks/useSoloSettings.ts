// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Content } from '../partials/Review';
import type { RewardDestinationType } from '../util/types';

import { useEffect, useMemo, useState } from 'react';

import useChainInfo from './useChainInfo';
import useEstimatedFee from './useEstimatedFee';
import useFormatted from './useFormatted';
import useSoloStakingInfo from './useSoloStakingInfo';
import useTranslation from './useTranslation';

  const makePayee = (value: RewardDestinationType, account: string | undefined, stashId: string | undefined) => {
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
  };

export default function useSoloSettings (address: string | undefined, genesisHash: string | undefined) {
  const { t } = useTranslation();

  const { rewardDestinationAddress, stakingAccount, stakingConsts } = useSoloStakingInfo(address, genesisHash);
  const { api } = useChainInfo(genesisHash);
  const formatted = useFormatted(address, genesisHash);

  const setPayee = api?.tx['staking']['setPayee'];

  const stashId = stakingAccount?.stashId.toString() ?? formatted ?? address;
  const ED = stakingConsts?.existentialDeposit;

  const [maybeNewPayee, setRewardDestinationType] = useState<RewardDestinationType>(undefined);
  const [specificAccount, setSpecificAccount] = useState<string | undefined>(undefined);

  const currentPayee = useMemo(() => {
    if (!stakingAccount?.rewardDestination) { /** in Westend it is null recently if user has not staked yet */
      return undefined;
    }

    const destinationType = Object.keys(stakingAccount.rewardDestination)[0];

    return destinationType.toLowerCase() === 'staked'
      ? 'Staked'
      : 'Others';
  }, [stakingAccount]);

  useEffect(() => {
    if (!stakingAccount) {
      return;
    }

    setRewardDestinationType(currentPayee);
  }, [currentPayee, stakingAccount]);

  const newPayee = useMemo(() => makePayee(maybeNewPayee, specificAccount ?? rewardDestinationAddress ?? stashId, stashId), [rewardDestinationAddress, maybeNewPayee, specificAccount, stashId]);

  const estimatedFee = useEstimatedFee(genesisHash, formatted, setPayee, [newPayee ?? 'Staked']);
  const changeToStaked = useMemo(() => currentPayee === 'Others' && maybeNewPayee === 'Staked', [maybeNewPayee, currentPayee]);

  const nextDisabled = useMemo(() =>
    currentPayee !== 'Staked' &&
     maybeNewPayee === 'Others' && (rewardDestinationAddress === specificAccount || !specificAccount)
  , [currentPayee, maybeNewPayee, rewardDestinationAddress, specificAccount]);

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: maybeNewPayee === 'Others' ? (specificAccount ?? rewardDestinationAddress ?? stashId) : 'Staked',
      title: t('Reward destination')
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    }];
  }, [estimatedFee, rewardDestinationAddress, maybeNewPayee, specificAccount, stashId, t]);

  const tx = useMemo(() =>
    newPayee
      ? setPayee?.(newPayee)
      : undefined
    , [newPayee, setPayee]);

  return {
    ED,
    changeToStaked,
    nextDisabled,
    rewardDestinationAddress,
    rewardDestinationType: maybeNewPayee,
    setRewardDestinationType,
    setSpecificAccount,
    specificAccount,
    transactionInformation,
    tx
  };
}
