// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '../../../../util/types';

import { Stack } from '@mui/material';
import { People } from 'iconsax-react';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useJoinPool, usePools, useSelectedAccount, useTranslation } from '../../../../hooks';
import { SORTED_BY } from '../../../../popup/staking/partial/PoolFilter';
import { FetchPoolProgress } from '../../../../popup/staking/pool-new/joinPool/ChoosePool';
import { VelvetBox } from '../../../../style';
import { PREFERRED_POOL_NAME } from '../../../../util/constants';
import HomeLayout from '../../../components/layout';
import PaginationRow from '../../../history/PaginationRow';
import { UndefinedItem } from '../../new-solo/nominations/ValidatorItem';
import FooterControls from '../../partials/FooterControls';
import StakingIcon from '../../partials/StakingIcon';
import TableToolbar from '../../partials/TableToolbar';
import { DEFAULT_POOL_ITEMS_PER_PAGE, POOL_ITEMS_PAGINATION_OPTIONS, sortingFunctions } from '../../util/utils';
import JoinPoolInput from './JoinPoolInput';
import PoolItem from './PoolItem';

function JoinPool () {
  const { t } = useTranslation();
  const selectedAccount = useSelectedAccount();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const pools = usePools(genesisHash);
  const navigate = useNavigate();

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

  const [sortConfig, setSortBy] = useState<string>(SORTED_BY.INDEX);
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPagePage] = useState<string | number>(DEFAULT_POOL_ITEMS_PER_PAGE);
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const filteredPools = useMemo(() => {
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

    if (filter.stakedThreshold && !filter.stakedThreshold.isZero()) {
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

  const poolsToShow = useMemo(() => {
    if (!filteredPools) {
      return undefined;
    }

    const start = (page - 1) * Number(itemsPerPage);
    const end = start + Number(itemsPerPage);

    return filteredPools.slice(start, end);
  }, [itemsPerPage, page, filteredPools]);

  useEffect(() => {
    dispatchFilter({
      payload: {
        commissionThreshold: undefined,
        isVerified: undefined,
        membersThreshold: undefined,
        sortBy: sortConfig,
        stakedThreshold: undefined
      },
      type: 'UPDATE'
    });
  }, [dispatchFilter, sortConfig]);

  const isSelected = useCallback((poolItem: PoolInfo) => selectedPool?.poolId === poolItem.poolId, [selectedPool?.poolId]);
  const selectPool = useCallback((poolItem: PoolInfo) => () => setSelectedPool(poolItem), [setSelectedPool]);
  const onReset = useCallback(() => setSelectedPool(undefined), [setSelectedPool]);
  const backToStakingHome = useCallback(() => navigate('/fullscreen-stake/pool/' + selectedAccount?.address + '/' + genesisHash) as void, [genesisHash, navigate, selectedAccount?.address]);
  const togglePopup = useCallback(() => setShowPopup((onPopup) => !onPopup), []);

  return (
    <>
      <HomeLayout>
        <Stack direction='column' sx={{ alignItems: 'flex-start', px: '18px', width: '100%' }}>
          <StakingIcon text={t('Join Pool')} type='pool' />
          <VelvetBox style={{ marginTop: '10px' }}>
            <FetchPoolProgress
              numberOfFetchedPools={numberOfFetchedPools}
              style={{ top: '-4px' }}
              totalNumberOfPools={totalNumberOfPools}
            />
            <Stack direction='column' sx={{ width: '100%' }}>
              <TableToolbar
                onSearch={onSearch}
                setSortBy={setSortBy}
                sortBy={filter.sortBy}
                sortByObject={SORTED_BY}
                style={{ p: '12px 18px' }}
              />
              <Stack direction='column' sx={{ gap: '2px', width: '100%' }}>
                {poolsToShow?.map((poolItem) => {
                  return (
                    <PoolItem
                      genesisHash={genesisHash}
                      isSelected={isSelected(poolItem)}
                      key={String(poolItem.poolId)}
                      onSelect={selectPool(poolItem)}
                      poolInfo={poolItem}
                    />
                  );
                })}
                {!poolsToShow && Array.from({ length: 10 }).map((_, index) => (<UndefinedItem key={index} noSocials />))}
              </Stack>
              {poolsToShow &&
                <PaginationRow
                  itemsPerPage={itemsPerPage}
                  options={POOL_ITEMS_PAGINATION_OPTIONS}
                  page={page}
                  setItemsPerPagePage={setItemsPerPagePage}
                  setPage={setPage}
                  totalItems={filteredPools?.length ?? 0}
                />}
            </Stack>
          </VelvetBox>
          <FooterControls
            Icon={People}
            isNextDisabled={!selectedPool}
            maxSelectable={1}
            onBack={backToStakingHome}
            onNext={togglePopup}
            onReset={onReset}
            selectedCount={selectedPool ? 1 : 0}
            style={{ pt: '15px' }}
          />
        </Stack>
      </HomeLayout>
      {showPopup &&
        <JoinPoolInput
          address={selectedAccount?.address}
          availableBalanceToStake={availableBalanceToStake}
          bondAmount={bondAmount}
          errorMessage={errorMessage}
          estimatedFee={estimatedFee}
          genesisHash={genesisHash}
          onBack={togglePopup}
          onInputChange={onInputChange}
          onMaxValue={onMaxValue}
          onMinValue={onMinValue}
          selectedPool={selectedPool}
          setBondAmount={setBondAmount}
          transactionInformation={transactionInformation}
          tx={tx}
        />}
    </>
  );
}

export default memo(JoinPool);
