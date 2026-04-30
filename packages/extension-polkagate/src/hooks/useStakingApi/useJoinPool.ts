// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { Content } from '../../partials/Review';
import type { PoolInfo } from '../../util/types';

import { useCallback, useMemo, useReducer, useState } from 'react';

import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { INITIAL_POOL_FILTER_STATE, poolFilterReducer } from '../../popup/staking/partial/PoolFilter';
import { amountToMachine, safeSubtraction } from '../../util';
import useChainInfo from '../useChainInfo';
import useEstimatedFee from '../useEstimatedFee';
import useFormatted from '../useFormatted';
import usePoolStakingInfo from '../usePoolStakingInfo';
import useTranslation from '../useTranslation';

export const useJoinPool = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();
  const { api, decimal } = useChainInfo(genesisHash);
  const stakingInfo = usePoolStakingInfo(address, genesisHash);
  const formatted = useFormatted(address, genesisHash);

  const join = api?.tx['nominationPools']['join']; // (amount, poolId)

  const [filter, dispatchFilter] = useReducer(poolFilterReducer, INITIAL_POOL_FILTER_STATE);
  const [searchedQuery, setSearchedQuery] = useState<string>('');
  const [bondAmount, setBondAmount] = useState<BN | undefined>(undefined);
  const [selectedPool, setSelectedPool] = useState<PoolInfo | undefined>(undefined);

  const tx = useMemo(() => {
    if (!join || !bondAmount || !selectedPool) {
      return undefined;
    }

    return join(bondAmount, selectedPool.poolId);
  }, [bondAmount, join, selectedPool]);

  const estimatedFee = useEstimatedFee(genesisHash, formatted, tx ?? join?.(bondAmount ?? BN_ONE, selectedPool?.poolId ?? 0));

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: bondAmount,
      itemKey: 'amount',
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    }];
  }, [bondAmount, estimatedFee, t]);

  const errorMessage = useMemo(() => {
    if (!bondAmount || !stakingInfo.availableBalanceToStake) {
      return undefined;
    }

    if (stakingInfo.availableBalanceToStake.isZero()) {
      return t('Not enough amount to stake more.');
    }

    if (bondAmount.gt(stakingInfo.availableBalanceToStake ?? BN_ZERO)) {
      return t('It is more than the available balance to stake.');
    }

    if (bondAmount.lt(stakingInfo.poolStakingConsts?.minJoinBond ?? BN_ZERO)) {
      return t('It is less than the minimum amount to join a pool.');
    }

    return undefined;
  }, [bondAmount, stakingInfo.availableBalanceToStake, stakingInfo.poolStakingConsts?.minJoinBond, t]);

  const onMaxValue = useMemo(() => {
    if (!formatted || !stakingInfo.availableBalanceToStake || !stakingInfo.stakingConsts) {
      return '0';
    }

    const maxAmount = safeSubtraction(stakingInfo.availableBalanceToStake.sub(stakingInfo.stakingConsts.existentialDeposit.muln(2)));

    return maxAmount.toString();
  }, [formatted, stakingInfo.availableBalanceToStake, stakingInfo.stakingConsts]);

  const onMinValue = useMemo(() => {
    if (!stakingInfo.poolStakingConsts) {
      return '0';
    }

    return stakingInfo.poolStakingConsts?.minJoinBond.toString();
  }, [stakingInfo.poolStakingConsts]);

  const onInputChange = useCallback((value: string | null | undefined) => {
    const valueAsBN = value ? amountToMachine(value, decimal) : BN_ZERO;

    setBondAmount(valueAsBN);
  }, [decimal, setBondAmount]);

  const onSearch = useCallback((query: string) => setSearchedQuery(query), []);

  return {
    availableBalanceToStake: stakingInfo.availableBalanceToStake,
    bondAmount,
    dispatchFilter,
    errorMessage,
    estimatedFee,
    filter,
    onInputChange,
    onMaxValue,
    onMinValue,
    onSearch,
    searchedQuery,
    selectedPool,
    setBondAmount,
    setSelectedPool,
    transactionInformation,
    tx
  };
};
