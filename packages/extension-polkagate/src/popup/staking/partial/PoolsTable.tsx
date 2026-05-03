// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '../../../util/types';

import { Container, IconButton, Stack, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowRight2 } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useRef } from 'react';

import PoolDetailFS from '../../../fullscreen/stake/new-pool/joinPool/PoolDetail';
import { useChainInfo, useIsExtensionPopup, useIsHovered, useTranslation } from '../../../hooks';
import { GradientDivider } from '../../../style';
import PRadio from '../components/Radio';
import { StakingInfoStack } from './NominatorsTable';
import PoolDetail from './PoolDetail';
import { PoolIdenticon } from './PoolIdenticon';

interface PoolDetailHandlerProps {
  poolDetail: PoolInfo | undefined;
  genesisHash: string | undefined;
  comprehensive: boolean;
  togglePoolDetail: (validatorInfo: PoolInfo | undefined) => () => void;
}

const PoolDetailHandler = ({ comprehensive, genesisHash, poolDetail, togglePoolDetail }: PoolDetailHandlerProps) => {
  const isExtension = useIsExtensionPopup();

  return useMemo(() => {
    if (isExtension) {
      return (
        <PoolDetail
          comprehensive={comprehensive}
          genesisHash={genesisHash}
          handleClose={togglePoolDetail(undefined)}
          poolDetail={poolDetail}
        />);
    }

    if (!poolDetail) {
      return <></>;
    }

    return (
      <PoolDetailFS
        genesisHash={genesisHash}
        onClose={togglePoolDetail(undefined)}
        poolDetail={poolDetail}
      />);
  }, [comprehensive, genesisHash, isExtension, poolDetail, togglePoolDetail]);
};

export const PoolStashIdentity = memo(function MemoPoolStashIdentity({ poolInfo, style }: { poolInfo: PoolInfo; style?: SxProps<Theme> }) {
  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '4px', display: 'flex', flexDirection: 'row', ...style }}>
      <PoolIdenticon
        poolInfo={poolInfo}
        size={24}
      />
      <Typography color='text.primary' id='poolMetadata' sx={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} variant='B-2'>
        {poolInfo.metadata}
      </Typography>
    </Container>
  );
});

interface PoolInfoProp {
  poolInfo: PoolInfo;
  genesisHash: string | undefined;
  onDetailClick: () => void;
  selectable?: boolean;
  selected?: PoolInfo | undefined;
  setSelectedPool?: React.Dispatch<React.SetStateAction<PoolInfo | undefined>>;
  status?: string;
  style?: React.CSSProperties;
}

export const PoolItem = ({ genesisHash, onDetailClick, poolInfo, selectable, selected, setSelectedPool, status, style }: PoolInfoProp) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const containerRef = useRef(null);
  const isHovered = useIsHovered(containerRef);
  const isDark = theme.palette.mode === 'dark';

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
  const rowBg = isDark ? (isSelected ? '#1C1D38' : '#110F2A') : '#FFFFFF';
  const rowBorderColor = isSelected ? '#FF4FB9' : isDark ? 'transparent' : '#E3E8F7';
  const rowShadow = isDark ? 'none' : '0 10px 22px rgba(106, 116, 156, 0.12)';
  const detailBg = isDark ? 'transparent' : '#E4D9F2';
  const detailIconColor = isDark ? '#FFFFFF' : '#745D8B';

  return (
    <Stack direction='column' sx={{ bgcolor: rowBg, border: '1px solid', borderColor: rowBorderColor, borderRadius: '14px', boxShadow: rowShadow, p: '8px', transition: 'all 150ms ease-out', width: '100%', ...style }}>
      <Container
        disableGutters
        onClick={handleContainerClick}
        ref={containerRef}
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
        {!status &&
          <IconButton onClick={onDetailClick} sx={{ bgcolor: detailBg, borderRadius: '8px', m: 0, p: '6px' }}>
            <ArrowRight2 color={detailIconColor} size='20' />
          </IconButton>
        }
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
  comprehensive?: boolean; // if it is true all the information will be shown in the table
}

export default function PoolsTable({ comprehensive, genesisHash, poolsInformation, selectable, selected, setSelectedPool }: PoolsTableProp): React.ReactElement {
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
      <PoolDetailHandler
        comprehensive={!!comprehensive}
        genesisHash={genesisHash}
        poolDetail={poolDetail}
        togglePoolDetail={togglePoolDetail}
      />
    </>
  );
}
