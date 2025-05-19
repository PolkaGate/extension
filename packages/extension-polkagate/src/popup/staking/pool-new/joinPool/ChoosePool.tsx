// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { LinearProgress, Stack } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router';

import { usePools2, useTranslation } from '../../../../hooks';
import PoolsTable from '../../partial/PoolsTable';
import Progress from '../../partial/Progress';

const FetchPoolProgress = ({ numberOfFetchedPools, totalNumberOfPools }: { totalNumberOfPools: number | undefined; numberOfFetchedPools: number; }) => (
  <LinearProgress
    sx={{ color: '#82FFA5', height: '2px', left: 0, position: 'absolute', right: 0, top: 0, width: '100%' }}
    value={totalNumberOfPools ? numberOfFetchedPools * 100 / totalNumberOfPools : 0}
    variant='determinate'
  />
);

export default function JoinPool () {
  const { t } = useTranslation();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const { incrementalPools, numberOfFetchedPools, totalNumberOfPools } = usePools2(genesisHash);

  return (
    <>
      <FetchPoolProgress
        numberOfFetchedPools={numberOfFetchedPools}
        totalNumberOfPools={totalNumberOfPools}
      />
      <Stack direction='column' sx={{ height: 'fit-content', maxHeight: '500px', overflowY: 'auto', px: '15px', width: '100%' }}>
        {incrementalPools === undefined &&
          <Progress
            loaderSize={40}
            text={t('Loading pools')}
          />
        }
        {incrementalPools &&
          <PoolsTable
            genesisHash={genesisHash}
            poolsInformation={incrementalPools}
          />
        }
      </Stack>
    </>
  );
}
