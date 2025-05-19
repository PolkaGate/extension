// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '../../../util/types';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Container, IconButton, Stack, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { useChainInfo, useTranslation } from '../../../hooks';
import { GradientDivider, PolkaGateIdenticon } from '../../../style';
import { StakingInfoStack } from './NominatorsTable';
import PoolDetail from './PoolDetail';

const PoolStashIdentity = ({ poolInfo }: { poolInfo: PoolInfo }) => {
  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '4px', display: 'flex', flexDirection: 'row' }}>
      <PolkaGateIdenticon
        address={poolInfo.stashIdAccount?.accountId.toString() ?? ''}
        size={24}
      />
      <Typography color='text.primary' sx={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} variant='B-2'>
        {poolInfo.metadata}
      </Typography>
    </Container>
  );
};

interface PoolInfoProp {
  poolInfo: PoolInfo;
  genesisHash: string | undefined;
  onDetailClick: () => void;
}

const PoolItem = ({ genesisHash, onDetailClick, poolInfo }: PoolInfoProp) => {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const maybeCommission = poolInfo.bondedPool?.commission.current.isSome ? poolInfo.bondedPool.commission.current.value[0] : 0;
  const commission = Number(maybeCommission) / (10 ** 7) < 1 ? 0 : Number(maybeCommission) / (10 ** 7);

  return (
    <Stack direction='column' sx={{ bgcolor: '#110F2A', borderRadius: '14px', p: '8px', width: '100%' }}>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '4px' }}>
        <PoolStashIdentity poolInfo={poolInfo} />
        <IconButton onClick={onDetailClick} sx={{ bgcolor: '#809ACB26', borderRadius: '12px', m: 0, p: '1px 6px' }}>
          <MoreHorizIcon sx={{ color: 'text.highlight', fontSize: '24px' }} />
        </IconButton>
      </Container>
      <GradientDivider style={{ my: '4px' }} />
      <Container disableGutters sx={{ alignItems: 'flex-end', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Container disableGutters sx={{ alignItems: 'flex-end', display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
          <StakingInfoStack amount={poolInfo.bondedPool?.points} decimal={decimal} title={t('Staked')} token={token} />
          <StakingInfoStack text={String(commission) + '%'} title={t('Commission')} />
          <StakingInfoStack text={poolInfo.bondedPool?.memberCounter.toString() ?? '0'} title={t('Members')} />
        </Container>
        {/* <IconButton onClick={onDetailClick} sx={{ m: 0, p: '4px' }}>
          <ArrowForwardIosIcon sx={{ color: 'text.primary', fontSize: '20px' }} /> // it is available in the design onFigma but has no functionality
        </IconButton> */}
      </Container>
    </Stack>
  );
};

interface PoolsTableProp {
  genesisHash: string | undefined;
  poolsInformation: PoolInfo[];
}

export default function PoolsTable ({ genesisHash, poolsInformation }: PoolsTableProp): React.ReactElement {
  const [poolDetail, setPoolDetail] = React.useState<PoolInfo | undefined>(undefined);

  const togglePoolDetail = useCallback((validatorInfo: PoolInfo | undefined) => () => {
    setPoolDetail(validatorInfo);
  }, []);

  return (
    <>
      <Stack direction='column' sx={{ height: 'fit-content', mb: '75px', mt: '15px', rowGap: '4px', width: '100%' }}>
        {poolsInformation.map((poolInfo, index) => (
          <PoolItem
            genesisHash={genesisHash}
            key={index}
            onDetailClick={togglePoolDetail(poolInfo)}
            poolInfo={poolInfo}
          />
        ))}
      </Stack>
      <PoolDetail
        genesisHash={genesisHash}
        handleClose={togglePoolDetail(undefined)}
        poolDetail={poolDetail}
      />
    </>
  );
}
