// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SoloStakingInfo } from '../../../hooks/useSoloStakingInfo';
import type { PopupCloser } from '../util/utils';

import { Container } from '@mui/material';
import React from 'react';

import { GradientButton } from '../../../components';
import { useChainInfo, useStakingInfoSolo, useTranslation } from '../../../hooks';
import { DraggableModal } from '../../components/DraggableModal';
import { InfoBox } from '../partials/InfoBox';

interface Props {
  genesisHash: string | undefined;
  stakingInfo: SoloStakingInfo;
  onClose: PopupCloser;
}

export default function Info({ genesisHash, onClose, stakingInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { decimal } = useChainInfo(genesisHash, true);

  const stakingStats = useStakingInfoSolo(stakingInfo, genesisHash);

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
      <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px', p: '20px 20px 0', position: 'relative', zIndex: 1 }}>
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
        <GradientButton
          onClick={onClose}
          style={{ marginTop: '12px' }}
          text={t('Close')}
        />
      </Container>
    </DraggableModal>
  );
}
