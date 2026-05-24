// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { UsePools } from '../../../../hooks/usePools';
import type { PoolInfo } from '../../../../util/types';

import { LinearProgress, Stack, type SxProps, type Theme } from '@mui/material';
import React, { useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { FadeOnScroll, Progress } from '../../../../components';
import { sortingFunctions } from '../../../../fullscreen/stake/util/utils';
import { useTranslation } from '../../../../hooks';
import { PREFERRED_POOL_NAME } from '../../../../util/constants';
import { type PoolFilterState, SORTED_BY } from '../../partial/PoolFilter';
import PoolsTable from '../../partial/PoolsTable';
import StakingActionButton from '../../partial/StakingActionButton';

export const FetchPoolProgress = ({ hideOnComplete, numberOfFetchedPools, style, totalNumberOfPools }: { hideOnComplete?: boolean, totalNumberOfPools: number | undefined; numberOfFetchedPools: number; style?: SxProps<Theme> }) => (
  <LinearProgress
    sx={{ color: '#82FFA5', display: hideOnComplete && numberOfFetchedPools === totalNumberOfPools ? 'none' : 'inherit', height: '2px', left: 0, position: 'absolute', right: 0, top: 0, width: '100%', ...style }}
    value={totalNumberOfPools ? numberOfFetchedPools * 100 / totalNumberOfPools : 0}
    variant='determinate'
  />
);

interface Props {
  onNext: () => void;
  selectedPool: PoolInfo | undefined;
  setSelectedPool: React.Dispatch<React.SetStateAction<PoolInfo | undefined>>;
  searchedQuery?: string;
  filter: PoolFilterState;
  pools: UsePools;
}

export default function ChoosePool({ filter, onNext, pools, searchedQuery, selectedPool, setSelectedPool }: Props) {
  const { t } = useTranslation();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const refContainer = useRef(null);

  const { incrementalPools, numberOfFetchedPools, totalNumberOfPools } = pools;

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

  return (
    <>
      <FetchPoolProgress
        numberOfFetchedPools={numberOfFetchedPools}
        totalNumberOfPools={totalNumberOfPools}
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
        <StakingActionButton
          disabled={!selectedPool}
          onClick={onNext}
          style={{
            bottom: '15px',
            height: '44px',
            left: '0',
            marginInline: '15px',
            position: 'absolute',
            right: '0',
            width: 'calc(100% - 30px)'
          }}
          text={t('Next')}
        />
      </Stack>
      <FadeOnScroll containerRef={refContainer} height='110px' ratio={0.5} />
    </>
  );
}
