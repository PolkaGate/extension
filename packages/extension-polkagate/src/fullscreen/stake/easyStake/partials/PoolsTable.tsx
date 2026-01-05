// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '../../../../util/types';

import { Stack } from '@mui/material';
import React, { memo, useCallback, useState } from 'react';

import PoolDetailFS from '../../new-pool/joinPool/PoolDetail';
import PoolItem from './PoolItem';

interface PoolsTableProp {
  genesisHash: string | undefined;
  poolsInformation: PoolInfo[];
  selected?: PoolInfo | undefined;
  selectable?: boolean;
  setSelectedPool?: React.Dispatch<React.SetStateAction<PoolInfo | undefined>>;
}

function PoolsTable({ genesisHash, poolsInformation, selectable, selected, setSelectedPool }: PoolsTableProp): React.ReactElement {
  const [poolDetail, setPoolDetail] = useState<PoolInfo | undefined>(undefined);

  const togglePoolDetail = useCallback((validatorInfo: PoolInfo | undefined) => () => {
    setPoolDetail(validatorInfo);
  }, []);

  const onSelect = useCallback(() => {
    setSelectedPool?.(poolDetail);
  }, [poolDetail, setSelectedPool]);

  return (
    <>
      <Stack direction='column' sx={{ height: 'fit-content', mb: '75px', rowGap: '2px', width: '100%' }}>
        {poolsInformation.map((poolInfo, index) => (
          <PoolItem
            genesisHash={genesisHash}
            key={index}
            onDetailClick={togglePoolDetail(poolInfo)}
            poolInfo={poolInfo}
            selectable={selectable}
            selected={selected}
            setSelectedPool={setSelectedPool}
          />
        ))}
      </Stack>
      <PoolDetailFS
        genesisHash={genesisHash}
        onClose={togglePoolDetail(undefined)}
        onSelect={onSelect}
        poolDetail={poolDetail}
      />
    </>
  );
}

export default memo(PoolsTable);
