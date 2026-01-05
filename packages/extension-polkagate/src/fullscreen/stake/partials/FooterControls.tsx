// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { Add, ArrowLeft, type Icon } from 'iconsax-react';
import React, { memo } from 'react';

import { ActionButton, GradientButton, GradientDivider } from '../../../components';
import { useTranslation } from '../../../hooks';

interface SelectionStatusProps {
  Icon: Icon;
  selectedCount: number | undefined;
  maxSelectable: number | undefined;
  onReset: () => void;
}

export const SelectionStatus = ({ Icon, maxSelectable, onReset, selectedCount }: SelectionStatusProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Grid container item sx={{ alignItems: 'center', width: 'fit-content' }}>
      <Icon color='#674394' size='18' variant='Bold' />
      <Typography color='#AA83DC' ml='4px' variant='B-2'>
        <span style={{ color: theme.palette.text.primary }}>{selectedCount || 0}</span>
        {t(' / {{maxSelectable}} selected', { replace: { maxSelectable } })}
      </Typography>
      <Add color='#674394' onClick={onReset} size='28' style={{ cursor: 'pointer', rotate: '45deg' }} />
    </Grid>
  );
};

interface Props extends SelectionStatusProps {
  onBack: () => void;
  onNext: () => void;
  isNextDisabled: boolean;
  style?: SxProps<Theme>;
}

function FooterControls ({ Icon, isNextDisabled, maxSelectable, onBack, onNext, onReset, selectedCount, style }: Props) {
  const { t } = useTranslation();

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', pt: '26px', width: '100%', zIndex: 1, ...style }}>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '6px', m: 0, width: 'fit-content' }}>
        <ActionButton
          StartIcon={ArrowLeft}
          contentPlacement='center'
          iconSize={24}
          iconVariant='Linear'
          onClick={onBack}
          style={{
            height: '44px',
            width: '90px'
          }}
          text={t('Back')}
          variant='text'
        />
        <GradientDivider
          isBlueish
          orientation='vertical'
          style={{ height: '40px', mx: '4px' }}
        />
        <SelectionStatus
          Icon={Icon}
          maxSelectable={maxSelectable}
          onReset={onReset}
          selectedCount={selectedCount}
        />
      </Container>
      <GradientButton
        disabled={isNextDisabled}
        onClick={onNext}
        style={{ height: '44px', width: '244px' }}
        text={t('Next')}
      />
    </Container>
  );
}

export default memo(FooterControls);
