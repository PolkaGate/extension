// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '../../../../util/types';

import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Container, IconButton } from '@mui/material';
import { BuyCrypto, PercentageSquare, Profile2User } from 'iconsax-react';
import React, { memo } from 'react';

import { noop } from '@polkadot/util';

import { Radio } from '../../../../components';
import { useChainInfo, useTranslation } from '../../../../hooks';
import { PoolStashIdentity } from '../../../../popup/staking/partial/PoolsTable';
import { InfoWithIcons } from '../../new-solo/nominations/ValidatorItem';

interface PoolItemProp {
  poolInfo: PoolInfo;
  genesisHash: string | undefined;
  onDetailClick: () => void;
  isSelected?: boolean;
  onSelect: () => void;
}

function PoolItem ({ genesisHash, isSelected, onDetailClick, onSelect, poolInfo }: PoolItemProp) {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const maybeCommission = poolInfo.bondedPool?.commission?.current?.isSome ? poolInfo.bondedPool.commission.current.value[0] : 0;
  const commission = Number(maybeCommission) / (10 ** 7) < 1 ? 0 : Number(maybeCommission) / (10 ** 7);

  return (
    <Container
      disableGutters
      onClick={onSelect}
      sx={{ alignItems: 'center', bgcolor: isSelected ? '#AA83DC1A' : '#05091C', borderRadius: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', minHeight: '45px', p: '2px 10px', pr: '2px' }}
    >
      <Radio
        checked={isSelected}
        onChange={noop}
        value={undefined}
      />
      <PoolStashIdentity
        poolInfo={poolInfo}
        style={{ '> span#poolMetadata': { maxWidth: '325px' }, m: 0, width: '350px' }}
      />
      <InfoWithIcons
        StartIcon={BuyCrypto}
        amount={poolInfo.bondedPool?.points}
        decimal={decimal}
        title={t('Staked')}
        token={token}
        width='150px'
      />
      <InfoWithIcons
        StartIcon={PercentageSquare}
        text={isNaN(commission) ? '---' : String(commission) + '%'}
        title={t('Commission')}
        width='120px'
      />
      <InfoWithIcons
        StartIcon={Profile2User}
        text={poolInfo.bondedPool?.memberCounter.toString() ?? '0'}
        title={t('Nominators')}
        width='120px'
      />
      {/* <InfoWithIcons
        StartIcon={ChartSquare}
        text={'--'}
        title={t('Status')}
      /> */}
      <IconButton
        onClick={onDetailClick}
        sx={{
          border: '2px solid #1B133C',
          borderRadius: '12px',
          p: '5px'
        }}
      >
        <MoreVertIcon sx={{ color: '#AA83DC', fontSize: '26px' }} />
      </IconButton>
    </Container>
  );
}

export default memo(PoolItem);
