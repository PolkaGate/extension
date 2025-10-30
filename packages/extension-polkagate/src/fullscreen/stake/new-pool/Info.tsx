// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolStakingInfo } from '../../../hooks/usePoolStakingInfo';
import type { PopupCloser, Stats } from '../util/utils';

import { Container, Stack, Typography, useTheme } from '@mui/material';
import { Bank, Hierarchy, People, UserEdit } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';

import { GradientButton } from '../../../components';
import { useChainInfo, useTranslation } from '../../../hooks';
import { DraggableModal } from '../../components/DraggableModal';
import { InfoBox } from '../partials/InfoBox';

interface Props {
  genesisHash: string | undefined;
  stakingInfo: PoolStakingInfo;
  onClose: PopupCloser;
}

export default function Info ({ genesisHash, onClose, stakingInfo }: Props): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const getValue = useCallback((value: number | undefined) => {
    if (value === undefined) {
      return '-';
    }

    return value === -1
      ? t('unlimited')
      : value;
  }, [t]);

  const stakingStats: Stats[] = useMemo(() => ([
    { label: t('Min {{token}} to join a pool', { replace: { token: token ?? '' } }), value: stakingInfo.poolStakingConsts?.minJoinBond, withLogo: true },
    { label: t('Min {{token}} to create a pool', { replace: { token: token ?? '' } }), value: stakingInfo.poolStakingConsts?.minCreationBond, withLogo: true },
    { InfoIcon: Bank, label: t('Number of existing pools'), value: stakingInfo.poolStakingConsts?.lastPoolId.toString() },
    { InfoIcon: Hierarchy, label: t('Max possible pools'), value: getValue(stakingInfo.poolStakingConsts?.maxPools) },
    { InfoIcon: People, label: t('Max possible pool members'), value: getValue(stakingInfo.poolStakingConsts?.maxPoolMembers) },
    { InfoIcon: UserEdit, label: t('Max pool members per pool'), value: getValue(stakingInfo.poolStakingConsts?.maxPoolMembersPerPool) }
  ]), [getValue, stakingInfo.poolStakingConsts?.lastPoolId, stakingInfo.poolStakingConsts?.maxPoolMembers, stakingInfo.poolStakingConsts?.maxPoolMembersPerPool, stakingInfo.poolStakingConsts?.maxPools, stakingInfo.poolStakingConsts?.minCreationBond, stakingInfo.poolStakingConsts?.minJoinBond, t, token]);

  return (
    <DraggableModal
      closeOnAnyWhereClick
      minHeight='auto'
      onClose={onClose}
      open
      showBackIconAsClose
      title={t('On-chain staking info')}
      width={520}
    >
      <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px', p: '20px', pb: 0, position: 'relative', zIndex: 1 }}>
        {stakingStats.map((stat, index) => (
          <InfoBox
            InfoIcon={stat.InfoIcon}
            decimal={decimal}
            genesisHash={stat.withLogo ? genesisHash : undefined}
            key={index}
            label={stat.label}
            value={stat.value}
          />
        ))}
        <Stack direction='column' sx={{ alignItems: 'flex-start', bgcolor: '#05091C', borderRadius: '14px', gap: '6px', p: '12px', width: '100%' }}>
          <Typography color={theme.palette.primary.main} variant='B-4' width='fit-content'>
            {t('To leave a pool as a member')}:
          </Typography>
          <Typography color={theme.palette.text.primary} pl='20px' variant='B-4'>
            {t('Unstake, wait for unstaking, then redeem')}.
          </Typography>
        </Stack>
        <Stack direction='column' sx={{ alignItems: 'flex-start', bgcolor: '#05091C', borderRadius: '14px', gap: '6px', p: '12px', width: '100%' }}>
          <Typography color={theme.palette.primary.main} variant='B-4' width='fit-content'>
            {t('To leave a pool as an owner')}:
          </Typography>
          <Typography color={theme.palette.text.primary} pl='20px' variant='B-4'>
            {t('Destroy pool, remove all, then leave as member')}.
          </Typography>
        </Stack>
        <GradientButton
          onClick={onClose}
          style={{ marginTop: '12px' }}
          text={t('Close')}
        />
      </Container>
    </DraggableModal>
  );
}
