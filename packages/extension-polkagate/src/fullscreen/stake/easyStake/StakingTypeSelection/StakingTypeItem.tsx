// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import React, { } from 'react';

import { noop } from '@polkadot/util';

import { useIsExtensionPopup, useTranslation } from '../../../../hooks';
import PRadio from '../../../../popup/staking/components/Radio';
import StakingIcon from '../../partials/StakingIcon';

interface StakingTypeItemProps {
  children: React.ReactNode;
  type: 'solo' | 'pool';
  isSelected: boolean;
  onClick: () => void;
}

export const StakingTypeItem = ({ children, isSelected, onClick, type }: StakingTypeItemProps) => {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cardBg = isDark ? (isExtension ? '#110F2A' : '#05091C') : '#FFFFFF';
  const borderColor = isSelected ? '#FF4FB9' : isDark ? 'transparent' : '#E3E8F7';
  const cardShadow = isDark ? 'none' : '0 12px 26px rgba(106, 116, 156, 0.14)';

  return (
    <Stack direction='column' onClick={onClick} sx={{ bgcolor: cardBg, border: '2px solid', borderColor, borderRadius: '14px', boxShadow: cardShadow, cursor: 'pointer', gap: '8px', p: '6px', pt: '24px' }}>
      <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', m: 0, pb: '14px', px: '24px' }}>
        <Grid container item sx={{ alignItems: 'center', flexWrap: 'nowrap', gap: '10px', width: 'fit-content' }}>
          <PRadio
            checked={isSelected}
            circleSize={20}
            onChange={noop}
            value={type}
          />
          <Typography color={isSelected ? '#FF4FB9' : 'text.primary'} variant='B-3' width='max-content'>
            {type === 'pool'
              ? t('Pool Staking')
              : t('Solo Staking')}
          </Typography>
        </Grid>
        <StakingIcon
          noText
          size='24'
          style={{ width: 'fit-content' }}
          type={type}
          variant={type === 'pool' ? 'people' : undefined}
        />
      </Container>
      {children}
    </Stack>
  );
};
