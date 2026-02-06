// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolStakingInfo } from '../../../hooks/usePoolStakingInfo';
import type { PopupCloser } from '../util/utils';

import { Container, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

import { GradientButton } from '../../../components';
import { useChainInfo, useStakingInfoPool, useTranslation } from '../../../hooks';
import { DraggableModal } from '../../components/DraggableModal';
import { InfoBox } from '../partials/InfoBox';

interface Props {
  genesisHash: string | undefined;
  stakingInfo: PoolStakingInfo;
  onClose: PopupCloser;
}

export default function Info({ genesisHash, onClose, stakingInfo }: Props): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const { decimal } = useChainInfo(genesisHash, true);

  const stakingStats = useStakingInfoPool(stakingInfo, genesisHash);

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
