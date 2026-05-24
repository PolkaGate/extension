// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Button, useTheme } from '@mui/material';
import React, { useMemo, useRef } from 'react';

import { useIsBlueish, useIsExtensionPopup, useIsHovered } from '../hooks';

interface Props {
  disabled?: boolean;
  isBusy?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  StartIcon?: Icon;
  EndIcon?: Icon;
  contentPlacement?: 'start' | 'center' | 'end';
  text: string | { firstPart?: string; secondPart?: string; };
  style?: React.CSSProperties;
}

export default function NeonButton({ EndIcon, StartIcon, contentPlacement = 'start', disabled, isBusy, onClick, style, text }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const containerRef = useRef(null);
  const hovered = useIsHovered(containerRef);
  const isExtension = useIsExtensionPopup();
  const isBlueish = useIsBlueish();
  const borderRadius = isExtension ? '12px' : '18px';

  const ButtonFontStyle = useMemo(() => ({
    color: hovered ? '#FF4FB9' : isBlueish ? theme.palette.text.highlight : theme.palette.text.secondary,
    ...theme.typography['B-2'],
    justifyContent: { center: 'center', end: 'flex-end', start: 'flex-start' }[contentPlacement],
    textTransform: 'none'
  } as React.CSSProperties), [contentPlacement, hovered, isBlueish, theme.palette.text.highlight, theme.palette.text.secondary, theme.typography]);

  const GeneralButtonStyle = {
    background: 'transparent',
    border: '1px solid',
    borderColor: hovered ? '#FF4FB9' : '#2D1E4A',
    borderRadius: `${style?.borderRadius ?? borderRadius}`,
    boxShadow: 'unset',
    padding: '6px 24px',
    transition: 'all 250ms ease-out',
    ...ButtonFontStyle
  };

  const StartIconStyle = {
    '& .MuiButton-startIcon': {
      marginLeft: 0,
      marginRight: '10px'
    },
    '& .MuiButton-startIcon svg': {
      color: hovered ? '#FF4FB9' : isBlueish ? theme.palette.text.highlight : theme.palette.text.secondary,
      transition: 'all 250ms ease-out'
    }
  };

  const EndIconStyle = {
    '& .MuiButton-endIcon': {
      marginLeft: '5px',
      marginRight: 0
    },
    '& .MuiButton-endIcon svg': {
      color: hovered ? '#FF4FB9' : isBlueish ? theme.palette.text.highlight : theme.palette.text.secondary,
      transition: 'all 250ms ease-out'
    }
  };

  const renderText = useMemo(() => {
    if (typeof text === 'string') {
      return <span style={{ color: theme.palette.text.primary, ...ButtonFontStyle }}>{text}</span>;
    } else {
      return (
        <>
          <span style={{ color: isBlueish ? theme.palette.text.highlight : theme.palette.text.secondary, ...ButtonFontStyle }}>{text.firstPart}</span>&nbsp;<span style={{ color: theme.palette.text.primary, ...ButtonFontStyle }}>{text.secondPart}</span>
        </>
      );
    }
  }, [ButtonFontStyle, isBlueish, text, theme.palette.text.highlight, theme.palette.text.primary, theme.palette.text.secondary]);

  return (
    <Button
      disabled={disabled || isBusy}
      endIcon={EndIcon
        ? <EndIcon size={20} variant={hovered ? 'Bold' : 'Bulk'} />
        : undefined}
      onClick={onClick}
      ref={containerRef}
      startIcon={StartIcon
        ? <StartIcon size={20} variant={hovered ? 'Bold' : 'Bulk'} />
        : undefined}
      sx={{ ...GeneralButtonStyle, ...StartIconStyle, ...EndIconStyle, ...style }}
    >
      {renderText}
    </Button>
  );
}
