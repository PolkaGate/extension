// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowCircleRight2, Setting } from 'iconsax-react';
import React, { useLayoutEffect, useRef, useState } from 'react';

import { useTranslation } from '../../../../hooks';

interface Props {
  onClick?: () => void;
  isAdvancedMode: boolean;
}

export default function ModeSwitch({ isAdvancedMode, onClick }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const standardRef = useRef<HTMLDivElement>(null);
  const advancedRef = useRef<HTMLDivElement>(null);
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const targetRef = isAdvancedMode ? advancedRef : standardRef;

    if (targetRef.current) {
      const { offsetLeft, offsetWidth } = targetRef.current;

      setHighlightStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [isAdvancedMode, t]);

  return (
    <Grid
      alignItems='center'
      columnGap='15px'
      container
      sx={{
        bgcolor: isDark ? '#2D1E4A' : '#EEF2FB',
        border: isDark ? 'none' : '1px solid #DDE3F4',
        borderRadius: '18px',
        height: '44px',
        mb: '10px',
        position: 'relative',
        px: '5px',
        userSelect: 'none',
        width: 'fit-content'
      }}
    >
      {/* Animated highlight */}
      <motion.div
        layout
        style={{
          background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
          borderRadius: '14px',
          height: '36px',
          left: highlightStyle.left,
          position: 'absolute',
          top: 4,
          width: highlightStyle.width,
          zIndex: 0
        }}
        transition={{ damping: 30, stiffness: 300, type: 'spring' }}
      />
      <Grid
        item
        onClick={onClick}
        ref={standardRef}
        sx={{
          alignItems: 'center',
          cursor: 'pointer',
          display: 'inline-flex',
          position: 'relative',
          px: '10px',
          py: '5px',
          zIndex: 1
        }}
      >
        <ArrowCircleRight2 color={isAdvancedMode ? '#AA83DC' : '#FFFFFF'} size='18' variant='Bulk' />
        <Typography color={isAdvancedMode ? 'text.secondary' : '#FFFFFF'} pl='5px' variant='B-2'>
          {t('Standard mode')}
        </Typography>
      </Grid>
      <Grid
        item
        onClick={onClick}
        ref={advancedRef}
        sx={{
          alignItems: 'center',
          cursor: 'pointer',
          display: 'inline-flex',
          position: 'relative',
          px: '10px',
          py: '5px',
          zIndex: 1
        }}
      >
        <Setting color={isAdvancedMode ? '#FFFFFF' : '#AA83DC'} size='18' variant='Bulk' />
        <Typography color={isAdvancedMode ? '#FFFFFF' : 'text.secondary'} pl='5px' variant='B-2'>
          {t('Advanced mode')}
        </Typography>
      </Grid>
    </Grid>
  );
}
