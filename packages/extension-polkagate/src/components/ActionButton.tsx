// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Button, type SxProps, type Theme, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { noop } from '@polkadot/util';

import { useIsDark, useIsExtensionPopup } from '../hooks';

interface Props {
  StartIcon?: Icon;
  iconVariant?: 'Bulk' | 'Broken' | 'TwoTone' | 'Outline' | 'Linear' | 'Bold';
  iconVariantOnHover?: 'Bulk' | 'Broken' | 'TwoTone' | 'Outline' | 'Linear' | 'Bold';
  contentPlacement?: 'start' | 'center' | 'end';
  disabled?: boolean;
  iconSize?: number;
  iconAlwaysBold?: boolean;
  isBusy?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  style?: SxProps<Theme> | undefined;
  text?: string | { firstPart?: string; secondPart?: string; };
  variant?: 'text' | 'contained' | 'outlined';
}

export default function ActionButton ({ StartIcon, contentPlacement = 'start', disabled, iconAlwaysBold, iconSize = 20, iconVariant, iconVariantOnHover, isBusy, onClick, style, text, variant }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const isDark = useIsDark();
  const isExtension = useIsExtensionPopup();
  const borderRadius = isExtension ? '12px' : '18px';

  const [hovered, setHovered] = useState(false);

  const toggleHover = useCallback(() => setHovered(!hovered), [hovered]);

  const ButtonFontStyle = useMemo(() => ({
    ...theme.typography['B-2'],
    justifyContent: { center: 'center', end: 'flex-end', start: 'flex-start' }[contentPlacement],
    textTransform: 'none'
  } as React.CSSProperties), [contentPlacement, theme.typography]);

  const GeneralButtonStyle = {
    '&:hover': {
      background: isDark ? '#674394' : '#EFF1F9',
      transition: 'all 250ms ease-out'
    },
    background: isDark ? '#2D1E4A' : '#FFFFFF',
    borderRadius: `${(style as Record<string, any>)?.['borderRadius'] ?? borderRadius}`,
    boxShadow: 'unset',
    justifyContent: 'flex-start',
    padding: '6px 24px',
    transition: 'all 250ms ease-out',
    ...ButtonFontStyle
  };

  const StartIconStyle = {
    '& .MuiButton-startIcon': {
      marginLeft: 0,
      marginRight: '16px'
    },
    '& .MuiButton-startIcon svg': {
      color: '#BEAAD8'
    }
  };

  const renderText = useMemo(() => {
    if (typeof text === 'string') {
      return <span style={{ color: isDark ? '#BEAAD8' : '#745D8B', ...ButtonFontStyle }}>
        {text}
      </span>;
    } else {
      return (
        <>
          <span style={{ color: theme.palette.text.secondary, ...ButtonFontStyle }}>{text?.firstPart}</span>&nbsp;<span style={{ color: theme.palette.text.primary, ...ButtonFontStyle }}>
            {text?.secondPart}
          </span>
        </>
      );
    }
  }, [ButtonFontStyle, isDark, text, theme.palette.text.primary, theme.palette.text.secondary]);

  return (
    <Button
      disabled={disabled || isBusy}
      onClick={onClick ?? noop}
      onMouseEnter={toggleHover}
      onMouseLeave={toggleHover}
      startIcon={StartIcon
        ? <StartIcon
          size={iconSize}
          variant={
            (iconAlwaysBold ?? hovered)
              ? iconVariantOnHover ?? 'Bold'
              : iconVariant ?? 'Bulk'
          }
        />
        : undefined}
      sx={{ ...GeneralButtonStyle, ...StartIconStyle, ...style }}
      variant={variant}
    >
      {renderText}
    </Button>
  );
}
