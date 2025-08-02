// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '@polkadot/extension-polkagate/util/types';

import { Stack } from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';

import { FadeOnScroll, Progress } from '../../../components';
import { usePools2, useTranslation } from '../../../hooks';
import PoolsTable from '../../../popup/staking/partial/PoolsTable';
import StakingActionButton from '../../../popup/staking/partial/StakingActionButton';
import { FetchPoolProgress } from '../../../popup/staking/pool-new/joinPool/ChoosePool';
import { EasyStakeSide, type SelectedEasyStakingType } from '../util/utils';

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

  const poolsToShow = incrementalPools;

  const onSelect = useCallback(() => {
    setSelectedStakingType({
      pool: selectedPool,
      type: 'pool',
      validators: undefined
    });
    setSide(EasyStakeSide.STAKING_TYPE);
  }, [selectedPool, setSelectedStakingType, setSide]);

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
          onClick={onSelect}
          style={{
            bottom: '15px',
            height: '44px',
            left: '0',
            marginInline: '15px',
            position: 'absolute',
            right: '0',
            width: 'calc(100% - 30px)'
          }}
          text={t('Select')}
        />
      </Stack>
      <FadeOnScroll containerRef={refContainer} height='110px' ratio={0.5} />
    </>
  );
}
