// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Box, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { noop } from '@polkadot/util';

import { loader } from '../assets/gif';
import { useIsDark } from '../hooks';

/**
 * Props for the GradientButton component.
 */
export interface Props {
  EndIcon?: Icon;
  contentPlacement?: 'start' | 'center' | 'end';
  disabled?: boolean;
  endIconNode?: React.ReactNode;
  isBusy?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  StartIcon?: Icon;
  startIconSize?: number;
  startIconNode?: React.ReactNode;
  text: string;
  style?: React.CSSProperties;
}

/**
 * A customizable button with optional gradient background, icons, and hover effects.
 *
 * @param {React.MouseEventHandler<HTMLButtonElement>} onClick - The click handler for the button.
 * @param {Icon} [StartIcon] - Optional icon to display at the start of the button.
 * @param {number} [startIconSize=20] - Optional size for the start icon.
 * @param {React.ReactNode} [startIconNode] - Optional node to display at the start of the button.
 * @param {Icon} [EndIcon] - Optional icon to display at the end of the button.
 * @param {React.ReactNode} [endIconNode] - Optional node to display at the end of the button.
 * @param {string} text - The text to display on the button.
 * @param {'start' | 'center' | 'end'} [contentPlacement='center'] - The placement of the text relative to the icons.
 * @param {React.CSSProperties} [style] - Optional style overrides for the button.
 * @param {boolean} [disabled=false] - Whether the button is disabled.
 *
 * @returns {React.ReactElement} The rendered gradient button.
 */
export default function GradientButton ({ EndIcon, StartIcon, contentPlacement = 'center', disabled, endIconNode, isBusy, onClick, startIconNode, startIconSize = 20, style, text }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const isDark = useIsDark();

  const [hovered, setHovered] = useState<boolean>(false);

  const toggleHovered = useCallback(() => {
    !disabled && setHovered(!hovered);
  }, [disabled, hovered]);

  const GradientButtonStyle = {
    alignItems: 'center',
    bgcolor: 'transparent',
    border: 'unset',
    cursor: disabled ? 'default' : 'pointer',
    height: '44px',
    justifyContent: { center: 'center', end: 'flex-end', start: 'flex-start' }[contentPlacement],
    opacity: disabled ? 0.3 : 1,
    paddingInline: '24px',
    position: 'relative',
    transition: 'all 250ms ease-out',
    width: '345px',
    ...style
  } as SxProps<Theme>;

  const GradientBackground = {
    /* ON HOVER EFFECT */
    '&::after': {
      background: '#6E00B1',
      borderRadius: `${style?.borderRadius ?? '12px'}`,
      content: '""',
      inset: '-2px',
      opacity: hovered ? 1 : 0,
      position: 'absolute',
      transition: 'all 250ms ease-out',
      zIndex: 1
    },
    /* BORDER GRADIENT */
    ...(!disabled && {
      '&::before': {
        background: 'linear-gradient(90deg, #AA0DEB 0%, #FF91E7 50%, #AA0DEB 100%)',
        borderRadius: `${style?.borderRadius ?? '12px'}`,
        content: '""',
        inset: '-2px',
        opacity: hovered ? 0 : 1,
        position: 'absolute',
        transition: 'all 250ms ease-out',
        zIndex: -1
      }
    }),
    /* BUTTON BACKGROUND GRADIENT */
    background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
    borderRadius: `${style?.borderRadius ?? '12px'}`,
    inset: disabled ? 0 : '2px',
    position: 'absolute',
    transition: 'all 250ms ease-out'
  } as SxProps<Theme>;

  return (
    <Grid component='button' container item onClick={disabled ? noop : onClick} onMouseEnter={toggleHovered} onMouseLeave={toggleHovered} sx={GradientButtonStyle}>
      {StartIcon && <StartIcon color={theme.palette.text.primary} size={startIconSize} style={{ marginRight: '2px', zIndex: 10 }} variant='Bulk' />}
      {startIconNode && startIconNode}
      {isBusy
        ? <Box
          component='img'
          src={loader as string}
          sx={{
            animation: 'spin 1.5s linear infinite',
            height: '42px',
            zIndex: 2,
            '@keyframes spin': {
              '0%': {
                transform: 'rotate(0deg)'
              },
              '100%': {
                transform: 'rotate(360deg)'
              }
            }
          }}
        />
        : <Typography color={isDark ? '#FFFFFF' : '#EAEBF1'} sx={{ pl: contentPlacement === 'center' ? 0 : '10px', pr: '2px', width: 'fit-content', zIndex: 10 }} variant='B-2'>
          {text}
        </Typography>
      }
      {EndIcon && <EndIcon color={theme.palette.text.primary} size='20' style={{ zIndex: 10 }} variant='Bulk' />}
      {endIconNode && endIconNode}
      <Grid sx={GradientBackground}></Grid>
    </Grid>
  );
}
