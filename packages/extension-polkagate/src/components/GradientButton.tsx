// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Button, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

interface Props {
  disabled?: boolean;
  isBusy?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  text: string;
  contentPlacement?: 'start' | 'center' | 'end';
  variant?: 'text' | 'contained' | 'outlined';
  style?: React.CSSProperties;
}

export default function GradientButton ({ contentPlacement = 'center', disabled, endIcon, isBusy, onClick, startIcon, style, text, variant }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  const [hovered, setHovered] = useState<boolean>(false);

  const toggleHovered = useCallback(() => setHovered(!hovered), [hovered]);

  const StartIconStyle = useMemo(() => ({
    '& .MuiButton-startIcon': {
      marginLeft: 0,
      marginRight: '16px'
    }
  }), []);

  const GradientButtonStyle = useMemo(() => ({
    '&.Mui-disabled': {
      opacity: 0.3,
      transition: 'opacity 0.3s ease'
    },
    '&::after': {
      background: 'linear-gradient(90deg, #AA0DEB 0%, #FF91E7 50%, #AA0DEB 100%)',
      borderRadius: `${style?.borderRadius ?? '12px'}`,
      boxShadow: 'none',
      content: '""',
      inset: '-2px',
      opacity: 1,
      position: 'absolute',
      transition: 'opacity 0.3s ease',
      zIndex: -1
    },
    '&:hover': {
      background: 'linear-gradient(262.56deg, #6E00B1 0%, #6E00B1 100%)',
      boxShadow: 'none'
    },
    '&:hover::after': {
      background: 'linear-gradient(180deg, #AA0DEB 0%, #FF91E7 50%, #AA0DEB 100%)',
      borderRadius: `${style?.borderRadius ?? '12px'}`,
      boxShadow: 'none',
      content: '""',
      inset: '-2px',
      position: 'absolute',
      zIndex: -1
    },
    background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
    borderRadius: `${style?.borderRadius ?? '12px'}`,
    boxShadow: 'none',
    color: theme.palette.text.primary,
    fontFamily: 'Inter',
    fontSize: '14px',
    fontWeight: 600,
    justifyContent: { center: 'center', end: 'flex-end', start: 'flex-start' }[contentPlacement],
    paddingInline: '24px',
    position: 'relative',
    textTransform: 'none',
    ...StartIconStyle
  }), [StartIconStyle, contentPlacement, style?.borderRadius, theme.palette.text.primary]);

  return (
    <Button disabled={disabled || isBusy} endIcon={endIcon} onClick={onClick} onMouseEnter={toggleHovered} onMouseLeave={toggleHovered} startIcon={startIcon} sx={{ ...GradientButtonStyle, ...style }} variant={variant}>
      {text}
    </Button>
  );
}
