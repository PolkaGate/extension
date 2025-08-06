// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '@polkadot/extension-polkagate/util/types';

import { Stack } from '@mui/material';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { FadeOnScroll, GradientButton, Progress, SearchField } from '../../../components';
import { usePools2, useTranslation } from '../../../hooks';
import { FetchPoolProgress } from '../../../popup/staking/pool-new/joinPool/ChoosePool';
import { PREFERRED_POOL_NAME } from '../../../util/constants';
import { EasyStakeSide, type SelectedEasyStakingType } from '../util/utils';
import PoolsTable from './partials/PoolsTable';

interface Props {
  genesisHash: string | undefined;
  setSelectedStakingType: React.Dispatch<React.SetStateAction<SelectedEasyStakingType | undefined>>;
  setSide: React.Dispatch<React.SetStateAction<EasyStakeSide>>;
}

export default function SelectPool ({ genesisHash, setSelectedStakingType, setSide }: Props) {
  const { t } = useTranslation();
  const refContainer = useRef(null);
  const { incrementalPools, numberOfFetchedPools, totalNumberOfPools } = usePools2(genesisHash);

  const [selectedPool, setSelectedPool] = useState<PoolInfo | undefined>(undefined);
  const [searchedQuery, setSearch] = useState<string>('');

  const poolsToShow = useMemo(() => {
    if (!incrementalPools) {
      return incrementalPools;
    }

    let filtered = incrementalPools;

    if (searchedQuery) {
      filtered = filtered.filter((pool) => pool.metadata?.toLowerCase().includes(searchedQuery.toLowerCase()));
    }

    // 🚀 Bring "PolkaGate" pool to top
    const index = filtered.findIndex((pool) => pool.metadata?.toLowerCase().includes(PREFERRED_POOL_NAME.toLowerCase()));

    if (index !== -1) {
      const [polkagatePool] = filtered.splice(index, 1);

      filtered.unshift(polkagatePool);
    }

    return filtered;
  }, [incrementalPools, searchedQuery]);

  const onSelect = useCallback(() => {
    setSelectedStakingType({
      pool: selectedPool,
      type: 'pool',
      validators: undefined
    });
    setSide(EasyStakeSide.STAKING_TYPE);
  }, [selectedPool, setSelectedStakingType, setSide]);

  const onSearch = useCallback((input: string) => {
    setSearch(input);
  }, []);

  return (
    <>
      <FetchPoolProgress
        numberOfFetchedPools={numberOfFetchedPools}
        totalNumberOfPools={totalNumberOfPools}
      />
      <Stack direction='column' ref={refContainer} sx={{ height: 'fit-content', maxHeight: '500px', overflowY: 'auto', px: '15px', width: '100%' }}>
        {incrementalPools === undefined &&
          <Progress
            style={{ marginTop: '90px' }}
            title={t('Loading pools')}
          />
        }
        {incrementalPools && poolsToShow && poolsToShow.length > 0 &&
          <>
            <SearchField
              onInputChange={onSearch}
              placeholder='🔍 Search'
              style={{
                height: '44px',
                marginBottom: '15px',
                // maxWidth: '410px',
                width: '410px'
              }}
            />
            <PoolsTable
              genesisHash={genesisHash}
              poolsInformation={poolsToShow}
              selectable
              selected={selectedPool}
              setSelectedPool={setSelectedPool}
            />
          </>
        }
        <GradientButton
          disabled={!selectedPool}
          onClick={onSelect}
          style={{
            bottom: '15px',
            height: '44px',
            left: '0',
            marginInline: '15px',
            position: 'absolute',
            right: '0',
            width: 'calc(100% - 30px)',
            zIndex: 10
          }}
          text={t('Select')}
        />
      </Stack>
      <FadeOnScroll containerRef={refContainer} height='110px' ratio={0.5} />
    </>
  );
}
