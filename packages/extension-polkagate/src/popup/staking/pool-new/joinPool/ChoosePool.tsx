// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { PoolInfo } from '../../../../util/types';
import type { PoolFilterState } from '../../partial/PoolFilter';

import { LinearProgress, Stack } from '@mui/material';
import React, { useMemo, useRef } from 'react';
import { useParams } from 'react-router';

import { FadeOnScroll } from '../../../../components';
import { usePools2, useTranslation } from '../../../../hooks';
import PoolsTable from '../../partial/PoolsTable';
import Progress from '../../partial/Progress';
import StakingActionButton from '../../partial/StakingActionButton';

const FetchPoolProgress = ({ numberOfFetchedPools, totalNumberOfPools }: { totalNumberOfPools: number | undefined; numberOfFetchedPools: number; }) => (
  <LinearProgress
    sx={{ color: '#82FFA5', height: '2px', left: 0, position: 'absolute', right: 0, top: 0, width: '100%' }}
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
}

export default function ChoosePool ({ filter, onNext, searchedQuery, selectedPool, setSelectedPool }: Props) {
  const { t } = useTranslation();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const refContainer = useRef(null);
  const { incrementalPools, numberOfFetchedPools, totalNumberOfPools } = usePools2(genesisHash);

  const poolsToShow = useMemo(() => {
    if (!incrementalPools) {
      return incrementalPools;
    }

    let filtered = incrementalPools;

    if (searchedQuery) {
      filtered = filtered.filter((pool) => pool.metadata?.includes(searchedQuery));
    }

    if (filter.isVerified) {
      filtered = filtered.filter((pool) => pool.identity);
    }

    if (filter.membersThreshold > 0) {
      filtered = filtered.filter((pool) => (pool.bondedPool?.memberCounter.toNumber() ?? 0) >= filter.membersThreshold);
    }

    if (!filter.stakedThreshold.isZero()) {
      filtered = filtered.filter((pool) => pool.bondedPool?.points.gte(filter.stakedThreshold));
    }

    if (filter.commissionThreshold !== undefined) {
      filtered = filtered.filter((pool) => {
        const maybeCommission = pool.bondedPool?.commission.current.isSome ? pool.bondedPool.commission.current.value[0] : 0;
        const commission = Number(maybeCommission) / (10 ** 7) < 1 ? 0 : Number(maybeCommission) / (10 ** 7);

        return commission >= filter.membersThreshold;
      });
    }

    return filtered;
  }, [filter.commissionThreshold, filter.isVerified, filter.membersThreshold, filter.stakedThreshold, incrementalPools, searchedQuery]);

  return (
    <>
      <FetchPoolProgress
        numberOfFetchedPools={numberOfFetchedPools}
        totalNumberOfPools={totalNumberOfPools}
      />
      <Stack direction='column' ref={refContainer} sx={{ height: 'fit-content', maxHeight: '500px', overflowY: 'auto', px: '15px', width: '100%' }}>
        {incrementalPools === undefined &&
          <Progress
            text={t('Loading pools')}
          />
        }
        {incrementalPools && poolsToShow &&
          <PoolsTable
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
