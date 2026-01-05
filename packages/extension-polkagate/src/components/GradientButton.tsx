// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowRight2, type Icon } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { noop } from '@polkadot/util';

import { useIsDark, useIsExtensionPopup } from '../hooks';
import { LoaderGif } from '.';

/**
 * Props for the GradientButton component.
 */
export interface GradientButtonProps {
  EndIcon?: Icon;
  contentPlacement?: 'start' | 'center' | 'end';
  disabled?: boolean;
  endIconNode?: React.ReactNode;
  isBusy?: boolean;
  showChevron?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  StartIcon?: Icon;
  startIconVariant?: 'Bulk' | 'Linear' | 'Outline' | 'Broken' | 'Bold' | 'TwoTone' | undefined;
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
export default function GradientButton ({ EndIcon, StartIcon, contentPlacement = 'center', disabled, endIconNode, isBusy, onClick, showChevron, startIconNode, startIconSize = 20, startIconVariant = 'Bulk', style, text }: GradientButtonProps): React.ReactElement<GradientButtonProps> {
  const theme = useTheme();
  const isDark = useIsDark();
  const isExtension = useIsExtensionPopup();
  const borderRadius = isExtension ? '12px' : '18px';

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
    opacity: disabled ? 0.5 : 1,
    paddingInline: '24px',
    position: 'relative',
    transition: 'all 250ms ease-out',
    width: '100%',
    // width: '345px',
    ...style
  } as SxProps<Theme>;

  const GradientBackground = {
    /* ON HOVER EFFECT */
    '&::after': {
      background: '#6E00B1',
      borderRadius: `${style?.borderRadius ?? borderRadius}`,
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
        borderRadius: `${style?.borderRadius ?? borderRadius}`,
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
    borderRadius: `${style?.borderRadius ?? borderRadius}`,
    inset: disabled ? 0 : '2px',
    position: 'absolute',
    transition: 'all 250ms ease-out'
  } as SxProps<Theme>;

  const chevronStyle: React.CSSProperties = {
    filter: 'drop-shadow(0px 0px 1px #EAEBF1)',
    marginLeft: '-5px',
    transition: 'all 500ms ease-out',
    zIndex: 10
  };

  const textStyle: React.CSSProperties = {
    transform: hovered ? 'translateX(-5px)' : '',
    transition: 'all 500ms ease-out'
  };

  return (
    <Grid component='button' container item onClick={disabled ? noop : onClick} onMouseEnter={toggleHovered} onMouseLeave={toggleHovered} sx={GradientButtonStyle}>
      {StartIcon && <StartIcon color={theme.palette.text.primary} size={startIconSize} style={{ marginRight: '2px', zIndex: 10 }} variant={startIconVariant} />}
      {startIconNode && startIconNode}
      {isBusy
        ? <LoaderGif />
        : <>
          <Typography color={isDark ? '#FFFFFF' : '#EAEBF1'} sx={{ pl: contentPlacement === 'center' ? 0 : '10px', pr: '2px', width: 'fit-content', zIndex: 10, ...(showChevron ? textStyle : {}) }} variant='B-2'>
            {text}
          </Typography>
          {showChevron && <ArrowRight2 color={hovered ? '#EAEBF1' : 'undefined'} size='12' style={chevronStyle} variant='Linear' />}
        </>
      }
      {EndIcon && <EndIcon color={theme.palette.text.primary} size='20' style={{ zIndex: 10 }} variant='Bulk' />}
      {endIconNode && endIconNode}
      <Grid sx={GradientBackground}></Grid>
    </Grid>
  );
}
