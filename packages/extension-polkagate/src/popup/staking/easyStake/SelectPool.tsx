// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '../../../util/types';

import { Grid, Stack } from '@mui/material';
import React, { useCallback, useMemo, useReducer, useRef, useState } from 'react';

import { DecisionButtons, FadeOnScroll, Motion, Progress } from '../../../components';
import { EasyStakeSide, type SelectedEasyStakingType, sortingFunctions } from '../../../fullscreen/stake/util/utils';
import { usePools, useTranslation } from '../../../hooks';
import { PREFERRED_POOL_NAME } from '../../../util/constants';
import JoinPoolBackButton from '../partial/JoinPoolBackButton';
import { INITIAL_POOL_FILTER_STATE, poolFilterReducer, SORTED_BY } from '../partial/PoolFilter';
import PoolsTable from '../partial/PoolsTable';
import { FetchPoolProgress } from '../pool-new/joinPool/ChoosePool';

interface Props {
  genesisHash: string | undefined;
  setSelectedStakingType: React.Dispatch<React.SetStateAction<SelectedEasyStakingType | undefined>>;
  selectedStakingType: SelectedEasyStakingType | undefined;
  setSide: React.Dispatch<React.SetStateAction<EasyStakeSide>>;
}

export default function SelectPool({ genesisHash, selectedStakingType, setSelectedStakingType, setSide }: Props) {
  const { t } = useTranslation();
  const refContainer = useRef(null);

  const { incrementalPools, numberOfFetchedPools, totalNumberOfPools } = usePools(genesisHash);

  const [filter, dispatchFilter] = useReducer(poolFilterReducer, INITIAL_POOL_FILTER_STATE);
  const [searchedQuery, setSearchedQuery] = useState<string>('');
  const [selectedPool, setSelectedPool] = useState<PoolInfo | undefined>(selectedStakingType?.pool);

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

  const onSearch = useCallback((query: string) => setSearchedQuery(query), []);
  const onBack = useCallback(() => setSide?.(EasyStakeSide.STAKING_TYPE), [setSide]);
  const onNext = useCallback(() => {
    setSelectedStakingType({
      pool: selectedPool,
      type: 'pool',
      validators: undefined
    });
    setSide(EasyStakeSide.STAKING_TYPE);
  }, [selectedPool, setSelectedStakingType, setSide]);

  return (
    <Motion style={{ height: 'calc(100vh - 50px)' }} variant='slide'>
      <FetchPoolProgress
        numberOfFetchedPools={numberOfFetchedPools}
        totalNumberOfPools={totalNumberOfPools}
      />
      <JoinPoolBackButton
        dispatchFilter={dispatchFilter}
        filter={filter}
        genesisHash={genesisHash}
        // noFilter={step === POOL_STEPS.CONFIG}
        onBack={onBack}
        onSearch={onSearch}
        stepCounter={{ currentStep: 1, totalSteps: 2 }}
        style={{ mb: '15px' }}
      />
      <Stack direction='column' ref={refContainer} sx={{ height: 'fit-content', maxHeight: '500px', overflowY: 'auto', px: '15px', width: '100%' }}>
        {incrementalPools === undefined &&
          <Progress
            title={t('Loading pools')}
          />
        }
        {incrementalPools && poolsToShow && poolsToShow.length > 0 &&
          <PoolsTable
            comprehensive={false}
            genesisHash={genesisHash}
            poolsInformation={poolsToShow}
            selectable
            selected={selectedPool}
            setSelectedPool={setSelectedPool}
          />
        }
      </Stack>
      <Grid container item sx={{ bottom: '15px', height: '44px', left: '0', m: 'auto', position: 'absolute', right: '0', width: 'calc(100% - 36px)', zIndex: 10 }}>
        <DecisionButtons
          cancelButton
          direction='horizontal'
          disabled={!selectedPool}
          divider
          onPrimaryClick={onNext}
          onSecondaryClick={onBack}
          primaryBtnText={t('Next')}
          secondaryBtnText={t('Back')}
        />
      </Grid>
      <FadeOnScroll containerRef={refContainer} height='110px' ratio={0.5} />
    </Motion>
  );
}
