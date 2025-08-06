// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '../../../../util/types';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Container, IconButton, Stack } from '@mui/material';
import { BuyCrypto, PercentageSquare, Profile2User } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useRef } from 'react';

import { noop } from '@polkadot/util';

import { useChainInfo, useIsHovered, useTranslation } from '../../../../hooks';
import PRadio from '../../../../popup/staking/components/Radio';
import { PoolStashIdentity } from '../../../../popup/staking/partial/PoolsTable';
import { GradientDivider } from '../../../../style';
import { InfoWithIcons } from '../../new-solo/nominations/ValidatorItem';

const OFFSET = 14;

interface PoolInfoProp {
  poolInfo: PoolInfo;
  genesisHash: string | undefined;
  onDetailClick: () => void;
  selectable?: boolean;
  selected?: PoolInfo | undefined;
  setSelectedPool?: React.Dispatch<React.SetStateAction<PoolInfo | undefined>>;
  style?: React.CSSProperties;
}

function PoolItem ({ genesisHash, onDetailClick, poolInfo, selectable, selected, setSelectedPool, style }: PoolInfoProp) {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const containerRef = useRef(null);
  const isHovered = useIsHovered(containerRef);

  const maybeCommission = poolInfo.bondedPool?.commission?.current?.isSome ? poolInfo.bondedPool.commission.current.value[0] : 0;
  const commission = Number(maybeCommission) / (10 ** 7) < 1 ? 0 : Number(maybeCommission) / (10 ** 7);

  const isSelected = useMemo(() => selected?.poolId === poolInfo.poolId, [poolInfo.poolId, selected?.poolId]);

  const onSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedPool = JSON.parse(event.target.value) as PoolInfo;

    setSelectedPool?.(selectedPool);
  }, [setSelectedPool]);

  const handleOnDetail = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onDetailClick();
  }, [onDetailClick]);

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
    <Stack direction='column' sx={{ bgcolor: isSelected ? '#1C1D38' : '#110F2A', borderRadius: '14px', p: '8px', transition: 'all 150ms ease-out', width: '100%', ...style }}>
      <Container
        disableGutters
        onClick={selectable ? handleContainerClick : noop}
        ref={containerRef}
        sx={{ alignItems: 'center', cursor: selectable ? 'pointer' : 'default', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '4px' }}
      >
        {selectable &&
          <PRadio
            checked={isSelected}
            circleSize={20}
            isHovered={isHovered}
            onChange={noop}
            value={JSON.stringify(poolInfo)}
          />}
        <PoolStashIdentity poolInfo={poolInfo} style={{ '> span#poolMetadata': { maxWidth: 'calc(100% - 34px)' }, m: 0, width: `calc(100% - ${(selectable ? 20 : 0) + 36 + OFFSET}px)` }} />
        <IconButton onClick={handleOnDetail} sx={{ bgcolor: '#809ACB26', borderRadius: '12px', m: 0, p: '1px 6px' }}>
          <MoreHorizIcon sx={{ color: 'text.highlight', fontSize: '24px' }} />
        </IconButton>
      </Container>
      <GradientDivider style={{ my: '4px' }} />
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-around', py: '5.5px' }}>
        <InfoWithIcons
          StartIcon={BuyCrypto}
          amount={poolInfo.bondedPool?.points}
          decimal={decimal}
          style={{ gap: '2px', maxWidth: '150px', width: 'fit-content' }}
          title={t('Staked')}
          token={token}
        />
        <InfoWithIcons
          StartIcon={PercentageSquare}
          style={{ gap: '2px', maxWidth: '120px', width: 'fit-content' }}
          text={String(commission) + '%'}
          title={t('Commission')}
        />
        <InfoWithIcons
          StartIcon={Profile2User}
          style={{ gap: '2px', maxWidth: '115px', width: 'fit-content' }}
          text={poolInfo.bondedPool?.memberCounter.toString() ?? '0'}
          title={t('Members')}
        />
      </Container>
    </Stack>
  );
}

export default memo(PoolItem);
