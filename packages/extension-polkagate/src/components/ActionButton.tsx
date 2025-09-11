// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Button, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { useMemo, useRef } from 'react';

import { noop } from '@polkadot/util';

import { useIsDark, useIsExtensionPopup, useIsHovered } from '../hooks';
import TwoToneText from './TwoToneText';

export interface ActionButtonProps {
  StartIcon?: Icon;
  iconVariant?: 'Bulk' | 'Broken' | 'TwoTone' | 'Outline' | 'Linear' | 'Bold';
  iconVariantOnHover?: 'Bulk' | 'Broken' | 'TwoTone' | 'Outline' | 'Linear' | 'Bold';
  contentPlacement?: 'start' | 'center' | 'end';
  disabled?: boolean;
  isBlueish?: boolean;
  iconSize?: number;
  iconAlwaysBold?: boolean;
  isBusy?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  style?: SxProps<Theme> | undefined;
  text?: string | { text?: string; textPartInColor?: string; };
  variant?: 'text' | 'contained' | 'outlined';
}

export default function ActionButton ({ StartIcon, contentPlacement = 'start', disabled, iconAlwaysBold, iconSize = 20, iconVariant, iconVariantOnHover, isBlueish, isBusy, onClick, style, text, variant }: ActionButtonProps): React.ReactElement<ActionButtonProps> {
  const theme = useTheme();
  const isDark = useIsDark();
  const containerRef = useRef(null);
  const hovered = useIsHovered(containerRef);
  const isExtension = useIsExtensionPopup();
  const borderRadius = isExtension ? '12px' : '18px';

  const ButtonFontStyle = useMemo(() => ({
    ...theme.typography['B-2'],
    justifyContent: { center: 'center', end: 'flex-end', start: 'flex-start' }[contentPlacement],
    textTransform: 'none'
  } as React.CSSProperties), [contentPlacement, theme.typography]);

  const GeneralButtonStyle = {
    '&:hover': {
      background: isDark ? isBlueish ? '#2E2948' : '#674394' : '#EFF1F9',
      transition: 'all 250ms ease-out'
    },
    background: isDark ? isBlueish ? '#809ACB26' : '#2D1E4A' : '#FFFFFF',
    border: isBlueish ? '1px solid #2E2948' : 'none',
    borderRadius: `${(style as Record<string, any>)?.['borderRadius'] ?? borderRadius}`,
    boxShadow: 'unset',
    justifyContent: 'flex-start',
    padding: '10px 24px',
    transition: 'all 250ms ease-out',
    ...ButtonFontStyle
  };

  const StartIconStyle = {
    '& .MuiButton-startIcon': {
      marginLeft: 0,
      marginRight: '16px'
    },
    '& .MuiButton-startIcon svg': {
      color: disabled ? '#BEAAD84D' : '#BEAAD8'
    }
  };

  const renderText = useMemo(() => {
    if (typeof text === 'string') {
      return <span style={{ color: disabled ? '#BEAAD84D' : isDark ? isBlueish ? '#809ACB' : '#BEAAD8' : '#745D8B', whiteSpace: 'nowrap', ...ButtonFontStyle }}>
        {text}
      </span>;
    } else {
      return (
        <Typography sx={{ color: isBlueish ? theme.palette.text.highlight : theme.palette.text.secondary, textAlign: 'left' }}>
          <TwoToneText
            color={isBlueish ? theme.palette.text.highlight : theme.palette.text.primary}
            style={ButtonFontStyle}
            text={text?.text ?? ''}
            textPartInColor={text?.textPartInColor ?? ''}
          />
        </Typography>
      );
    }
  }, [ButtonFontStyle, disabled, isBlueish, isDark, text, theme]);

  return (
    <Button
      disabled={disabled || isBusy}
      onClick={onClick ?? noop}
      ref={containerRef}
      startIcon={StartIcon
        ? (
          <StartIcon
            color={
              disabled
                ? '#BEAAD84D'
                : isBlueish
                  ? theme.palette.text.highlight
                  : theme.palette.primary.main
            }
            size={iconSize}
            variant={
              (iconAlwaysBold ?? hovered)
                ? iconVariantOnHover ?? 'Bold'
                : iconVariant ?? 'Bulk'
            }
          />)
        : undefined}
      sx={{
        '&.Mui-disabled': {
          backgroundColor: '#2D1E4A4D'
        },
        ...GeneralButtonStyle,
        ...StartIconStyle,
        ...style
      }}
      variant={variant}
    >
      {renderText}
    </Button>
  );
}
