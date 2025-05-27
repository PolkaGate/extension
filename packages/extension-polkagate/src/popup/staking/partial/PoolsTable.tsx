// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '../../../util/types';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Box, Container, IconButton, Stack, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { logoPink } from '@polkadot/extension-polkagate/src/assets/logos/index';

import { useChainInfo, useTranslation } from '../../../hooks';
import { GradientDivider, PolkaGateIdenticon } from '../../../style';
import PRadio from '../components/Radio';
import { StakingInfoStack } from './NominatorsTable';
import PoolDetail from './PoolDetail';

const PoolStashIdentity = ({ poolInfo }: { poolInfo: PoolInfo }) => {
  const isPolkagate = poolInfo.metadata?.toLocaleLowerCase().includes('polkagate');

  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '4px', display: 'flex', flexDirection: 'row' }}>
      {isPolkagate
        ? <Box
          component='img'
          src={logoPink as string}
          sx={{ height: 24, width: 24 }}
        />
        : <PolkaGateIdenticon
          address={poolInfo.stashIdAccount?.accountId.toString() ?? ''}
          size={24}
        />
      }
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
  selectable?: boolean;
  selected?: PoolInfo | undefined;
  setSelectedPool?: React.Dispatch<React.SetStateAction<PoolInfo | undefined>>;
  status?: string;
}

export const PoolItem = ({ genesisHash, onDetailClick, poolInfo, selectable, selected, setSelectedPool, status }: PoolInfoProp) => {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const [isHovered, setIsHovered] = useState(false);

  const maybeCommission = poolInfo.bondedPool?.commission?.current?.isSome ? poolInfo.bondedPool.commission.current.value[0] : 0;
  const commission = Number(maybeCommission) / (10 ** 7) < 1 ? 0 : Number(maybeCommission) / (10 ** 7);

  const isSelected = useMemo(() => selected?.poolId === poolInfo.poolId, [poolInfo.poolId, selected?.poolId]);

  const onSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedPool = JSON.parse(event.target.value) as PoolInfo;

    setSelectedPool?.(selectedPool);
  }, [setSelectedPool]);

  const handleContainerClick = useCallback(() => {
    if (!isSelected) {
      const syntheticEvent = {
        target: {
          value: JSON.stringify(poolInfo)
        }
      } as React.ChangeEvent<HTMLInputElement>;

      onSelect(syntheticEvent);
    }
  }, [isSelected, onSelect, poolInfo]);

  return (
    <Stack direction='column' sx={{ bgcolor: isSelected ? '#1C1D38' : '#110F2A', borderRadius: '14px', p: '8px', transition: 'all 150ms ease-out', width: '100%' }}>
      <Container
        disableGutters
        onClick={handleContainerClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '4px' }}
      >
        <PoolStashIdentity poolInfo={poolInfo} />
        {selectable &&
          <PRadio
            checked={isSelected}
            circleSize={20}
            isHovered={isHovered}
            onChange={onSelect}
            value={JSON.stringify(poolInfo)}
          />}
      </Container>
      <GradientDivider style={{ my: '4px' }} />
      <Container disableGutters sx={{ alignItems: 'flex-end', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Container disableGutters sx={{ alignItems: 'flex-end', display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
          <StakingInfoStack amount={poolInfo.bondedPool?.points} decimal={decimal} title={t('Staked')} token={token} />
          <StakingInfoStack text={String(commission) + '%'} title={t('Commission')} />
          <StakingInfoStack text={poolInfo.bondedPool?.memberCounter.toString() ?? '0'} title={t('Members')} />
          {status &&
            <StakingInfoStack secondaryColor='#3988FF' text={status} title={t('Status')} />
          }
        </Container>
        {!status && <IconButton onClick={onDetailClick} sx={{ bgcolor: '#809ACB26', borderRadius: '12px', m: 0, p: '1px 6px' }}>
          <MoreHorizIcon sx={{ color: 'text.highlight', fontSize: '24px' }} />
        </IconButton>}
      </Container>
    </Stack>
  );
};

interface PoolsTableProp {
  genesisHash: string | undefined;
  poolsInformation: PoolInfo[];
  selectable?: boolean;
  selected?: PoolInfo | undefined;
  setSelectedPool?: React.Dispatch<React.SetStateAction<PoolInfo | undefined>>;
  comprehension?: boolean; // if it is true all the information will be shown in the table

}

export default function PoolsTable ({ comprehension, genesisHash, poolsInformation, selectable, selected, setSelectedPool }: PoolsTableProp): React.ReactElement {
  const [poolDetail, setPoolDetail] = React.useState<PoolInfo | undefined>(undefined);

  const togglePoolDetail = useCallback((validatorInfo: PoolInfo | undefined) => () => {
    setPoolDetail(validatorInfo);
  }, []);

  return (
    <>
      <Stack direction='column' sx={{ height: 'fit-content', mb: '75px', rowGap: '4px', width: '100%' }}>
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
      <PoolDetail
        comprehension={comprehension}
        genesisHash={genesisHash}
        handleClose={togglePoolDetail(undefined)}
        poolDetail={poolDetail}
      />
    </>
  );
}
