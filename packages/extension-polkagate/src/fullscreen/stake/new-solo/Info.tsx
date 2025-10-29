// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SoloStakingInfo } from '../../../hooks/useSoloStakingInfo';
import type { PopupCloser, Stats } from '../util/utils';

import { Container } from '@mui/material';
import { Calendar, Discover, MagicStar } from 'iconsax-react';
import React, { useMemo } from 'react';

import { GradientButton } from '../../../components';
import { useChainInfo, useTranslation } from '../../../hooks';
import { DraggableModal } from '../../components/DraggableModal';
import { InfoBox } from '../partials/InfoBox';

interface Props {
  genesisHash: string | undefined;
  stakingInfo: SoloStakingInfo;
  onClose: PopupCloser;
}

export default function Info ({ genesisHash, onClose, stakingInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const stakingStats: Stats[] = useMemo(() => ([
    { InfoIcon: Discover, label: t('Max Validators you can select'), value: stakingInfo.stakingConsts?.maxNominations },
    { label: t('Min {{token}} to be staker', { replace: { token: token ?? '' } }), value: stakingInfo.stakingConsts?.minNominatorBond, withLogo: true },
    { label: t('Min {{token}} to receive rewards', { replace: { token: token ?? '' } }), value: 250, withLogo: true },
    { InfoIcon: MagicStar, label: t('Max nominators of a validator, who may receive rewards'), value: stakingInfo.stakingConsts?.maxNominatorRewardedPerValidator },
    { InfoIcon: Calendar, label: t('Days it takes to receive your funds back after unstaking'), value: stakingInfo.stakingConsts?.unbondingDuration },
    { label: t('Min {{token}} that must remain in your account (ED)', { replace: { token: token ?? '' } }), value: 1, withLogo: true }
  ]), [stakingInfo.stakingConsts?.maxNominations, stakingInfo.stakingConsts?.maxNominatorRewardedPerValidator, stakingInfo.stakingConsts?.minNominatorBond, stakingInfo.stakingConsts?.unbondingDuration, t, token]);

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
