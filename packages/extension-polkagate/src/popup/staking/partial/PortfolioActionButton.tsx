// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */

import type { Icon } from 'iconsax-react';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { noop } from '@polkadot/util';

export interface PortfolioActionButtonProps {
  text: string;
  Icon: Icon;
  onClick: () => void;
  disabled?: boolean;
  isFullScreen?: boolean;
}

export default function PortfolioActionButton({ Icon, disabled = false, isFullScreen = false, onClick, text }: PortfolioActionButtonProps): React.ReactElement {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isLightFullscreen = isFullScreen && !isDark;
  const isLightPopup = !isFullScreen && !isDark;

  const background = useMemo(() =>
    isFullScreen
      ? isDark
        ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)'
        : '#745E9F'
      : isDark ? '#809ACB40' : '#EEF1FF'
    , [isDark, isFullScreen]);

  const defaultTextColor = useMemo(() =>
    isLightFullscreen
      ? '#41356F'
      : undefined
    , [isLightFullscreen]);

  const disabledColor = useMemo(() =>
    isLightFullscreen ? '#A795C3' : '#809ACB8C'
    , [isLightFullscreen]);

  const textColor = useMemo(() =>
    disabled
      ? disabledColor
      : defaultTextColor ?? (isFullScreen ? theme.palette.text.primary : theme.palette.text.highlight),
  [defaultTextColor, disabled, disabledColor, isFullScreen, theme.palette.text.highlight, theme.palette.text.primary]);

  return (
    <Grid
      alignItems='center'
      container
      item
      onClick={disabled ? noop : onClick}
      sx={{
        ':hover': {
          background,
          borderColor: isLightFullscreen ? '#DDE3F4' : 'transparent',
          color: isLightPopup ? '#745E9F' : '#FFFFFF',
          '& .portfolio-action-text': {
            color: isLightPopup ? '#745E9F' : '#FFFFFF'
          }
        },
        bgcolor: isFullScreen
          ? isDark
            ? '#05091C'
            : disabled ? '#F5F7FF' : '#FFFFFF'
          : 'transparent',
        border: '1px solid',
        borderColor: isFullScreen ? (isDark ? 'transparent' : '#DDE3F4') : '#809ACB40',
        borderRadius: '12px',
        boxShadow: isLightFullscreen ? '0 6px 16px rgba(133, 140, 176, 0.12)' : 'none',
        color: textColor,
        columnGap: '5px',
        cursor: disabled ? 'default' : 'pointer',
        p: isFullScreen ? '10px 14px' : '4px 7px',
        transition: 'all 150ms ease-out',
        width: 'fit-content'
      }}
    >
      <Icon
        className='portfolio-action-icon'
        color='currentColor'
        size={isFullScreen ? 24 : 19}
        variant='Bulk'
      />
      <Typography
        className='portfolio-action-text'
        color='inherit'
        variant={isFullScreen ? 'B-6' : 'B-2'}
      >
        {text}
      </Typography>
    </Grid>
  );
}
