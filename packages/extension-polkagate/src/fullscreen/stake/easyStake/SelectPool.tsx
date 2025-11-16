// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '@polkadot/extension-polkagate/util/types';

import { Stack } from '@mui/material';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { NothingFound } from '@polkadot/extension-polkagate/src/partials';

import { DecisionButtons, FadeOnScroll, Progress, SearchField } from '../../../components';
import { usePools, useTranslation } from '../../../hooks';
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
  const { incrementalPools, numberOfFetchedPools, totalNumberOfPools } = usePools(genesisHash);

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

  const onClear = useCallback(() => {
    setSelectedPool(undefined);
    setSearch('');
  }, []);

  return (
    <>
      <FetchPoolProgress
        hideOnComplete
        numberOfFetchedPools={numberOfFetchedPools}
        totalNumberOfPools={totalNumberOfPools}
      />
      <Stack direction='column' ref={refContainer} sx={{ height: 'fit-content', maxHeight: '620px', minHeight: '620px', overflowY: 'auto', px: '15px', width: '100%' }}>
        {incrementalPools === undefined &&
          <Progress
            style={{ marginTop: '90px' }}
            title={t('Loading pools')}
          />
        }
        {incrementalPools !== undefined &&
          <SearchField
            onInputChange={onSearch}
            placeholder={t('🔍 Search')}
            style={{
              height: '44px',
              margin: '17px 0 18px',
              width: '410px'
            }}
          />
        }
        {incrementalPools && poolsToShow && poolsToShow.length > 0 &&
          <PoolsTable
            genesisHash={genesisHash}
            poolsInformation={poolsToShow}
            selectable
            selected={selectedPool}
            setSelectedPool={setSelectedPool}
          />
        }
        <NothingFound
          show={incrementalPools !== undefined && (poolsToShow === null || poolsToShow?.length === 0)}
          style={{ pt: '100px' }}
          text={t('Pool Not Found')}
        />
        <DecisionButtons
          cancelButton
          direction='horizontal'
          disabled={!selectedPool}
          divider
          dividerStyle={{ background: 'linear-gradient(180deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)' }}
          onPrimaryClick={onSelect}
          onSecondaryClick={onClear}
          primaryBtnText={t('Next')}
          secondaryBtnText={t('Clear')}
          secondaryButtonProps={{ style: { width: '134px' } }}
          style={{
            bottom: '15px',
            display: 'flex',
            flexDirection: 'row-reverse',
            height: '44px',
            left: '0',
            position: 'absolute',
            right: '0',
            width: '94%',
            zIndex: 10
          }}
        />
      </Stack>
      <FadeOnScroll containerRef={refContainer} height='110px' ratio={0.7} />
    </>
  );
}
