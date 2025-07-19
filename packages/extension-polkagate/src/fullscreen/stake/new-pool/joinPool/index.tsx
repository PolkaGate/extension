// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React, { memo, useMemo } from 'react';
import { useParams } from 'react-router';

import { usePools2, useSelectedAccount, useTranslation } from '../../../../hooks';
import { SORTED_BY } from '../../../../popup/staking/partial/PoolFilter';
import { VelvetBox } from '../../../../style';
import { useJoinPool } from '../../../../util/api';
import { PREFERRED_POOL_NAME } from '../../../../util/constants';
import HomeLayout from '../../../components/layout';
import StakingIcon from '../../partials/StakingIcon';
import { sortingFunctions } from '../../util/utils';
import TableToolbar from '../../partials/TableToolbar';

function JoinPool () {
  const { t } = useTranslation();
  const selectedAccount = useSelectedAccount();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const pools = usePools2(genesisHash);

  const { incrementalPools, numberOfFetchedPools, totalNumberOfPools } = pools;

  const { availableBalanceToStake,
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
    tx } = useJoinPool(selectedAccount?.address, genesisHash);

  const poolsToShow = useMemo(() => {
    if (!incrementalPools) {
      return incrementalPools;
    }

    let filtered = incrementalPools;

    if (searchedQuery) {
      filtered = filtered.filter((pool) => pool.metadata?.toLowerCase().includes(searchedQuery.toLowerCase()));
    }

    if (filter.isVerified) {
      filtered = filtered.filter((pool) => pool.identity);
    }

    if (filter.membersThreshold > 0) {
      filtered = filtered.filter((pool) => (pool.bondedPool?.memberCounter.toNumber() ?? 0) >= filter.membersThreshold);
    }

    if (!filter.stakedThreshold?.isZero()) {
      filtered = filtered.filter(({ bondedPool }) => !!bondedPool?.points?.gte(filter.stakedThreshold));
    }

    if (filter.commissionThreshold !== undefined) {
      filtered = filtered.filter(({ bondedPool }) => {
        if (!bondedPool) {
          return false;
        }

        const maybeCommission = bondedPool?.commission?.current?.isSome ? bondedPool.commission.current.value[0] : 0;
        const commission = Number(maybeCommission) / (10 ** 7) < 1 ? 0 : Number(maybeCommission) / (10 ** 7);

        return commission <= (filter.commissionThreshold ?? 100);
      });
    }

    // Apply sorting
    const sortFunction = sortingFunctions[filter.sortBy as keyof typeof sortingFunctions] || sortingFunctions[SORTED_BY.INDEX];

    if (sortFunction) {
      filtered = [...filtered].sort(sortFunction);
    }

    // 🚀 Bring "PolkaGate" pool to top
    const index = filtered.findIndex((pool) => pool.metadata?.toLowerCase().includes(PREFERRED_POOL_NAME.toLowerCase()));

    if (index !== -1) {
      const [polkagatePool] = filtered.splice(index, 1);

      filtered.unshift(polkagatePool);
    }

    return filtered;
  }, [filter.commissionThreshold, filter.isVerified, filter.membersThreshold, filter.sortBy, filter.stakedThreshold, incrementalPools, searchedQuery]);

  return (
    <>
      <HomeLayout>
        <Stack direction='column' sx={{ alignItems: 'flex-start', px: '18px', width: '100%' }}>
          <StakingIcon text={t('Join Pool')} type='pool' />
          <VelvetBox>
            <Stack direction='column' sx={{ width: '100%' }}>
              <TableToolbar
                onSearch={onSearch}
                setSortBy={}
                sortBy={filter.sortBy}
                sortByObject={}
              />
              <Stack direction='column' sx={{ gap: '2px', width: '100%' }}>

              </Stack>
            </Stack>
          </VelvetBox>
        </Stack>
      </HomeLayout>
    </>
  );
}

export default memo(JoinPool);
