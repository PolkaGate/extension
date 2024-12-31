// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Icon } from 'iconsax-react';

import { Button, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

interface Props {
  disabled?: boolean;
  isBusy?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  StartIcon?: Icon;
  // endIcon?: React.ReactNode;
  text: string | { firstPart: string; secondPart: string; };
  variant?: 'text' | 'contained' | 'outlined';
  style?: React.CSSProperties;
}

export default function ActionButton ({ StartIcon, disabled, isBusy, onClick, style, text, variant }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  const [hovered, setHovered] = useState(false);

  const toggleHover = useCallback(() => setHovered(!hovered), [hovered]);

  const ButtonFontStyle = useMemo(() => ({
    fontFamily: 'Inter',
    fontSize: '14px',
    fontWeight: 600,
    textTransform: 'none'
  } as React.CSSProperties), []);

  const GeneralButtonStyle = {
    '&:hover': {
      background: '#674394',
      transition: 'all 250ms ease-out'
    },
    background: '#2D1E4A',
    borderRadius: `${style?.borderRadius ?? '12px'}`,
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
      return <span style={{ color: theme.palette.text.primary, ...ButtonFontStyle }}>{text}</span>;
    } else {
      return (
        <>
          <span style={{ color: theme.palette.text.secondary, ...ButtonFontStyle }}>{text.firstPart}</span>&nbsp;<span style={{ color: theme.palette.text.primary, ...ButtonFontStyle }}>{text.secondPart}</span>
        </>
      );
    }
  }, [ButtonFontStyle, text, theme.palette.text.primary, theme.palette.text.secondary]);

  return (
    <Button
      disabled={disabled || isBusy}
      onClick={onClick}
      onMouseEnter={toggleHover}
      onMouseLeave={toggleHover}
      startIcon={StartIcon
        ? <StartIcon size={20} variant={hovered ? 'Bold' : 'Bulk'} />
        : undefined}
      sx={{ ...GeneralButtonStyle, ...StartIconStyle, ...style }}
      variant={variant}
    >
      {renderText}
    </Button>
  );
}
