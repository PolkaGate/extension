// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Box, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { type MouseEventHandler } from 'react';

import { noop } from '../util/utils';

interface Props {
  disabled?: boolean;
  icon?: string;
  iconComponent?: React.JSX.Element;
  text: string;
  children?: React.ReactElement<Props>;
  onClick?: MouseEventHandler<HTMLDivElement>;
  showChevron?: boolean;
  showSubMenu?: boolean;
  py?: string;
  fontSize?: string;
  pl?: string;
  withHoverEffect?: boolean;
}

export default function MenuItem({ children, disabled = false, fontSize, icon, iconComponent, onClick, pl = '0', py = '8px', showChevron, showSubMenu = false, text, withHoverEffect }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  const hoverEffectStyles: SxProps<Theme> = {
    '&:hover': { bgcolor: disabled ? 'none' : 'divider' },
    borderRadius: '5px',
    p: '8px'
  };

  return (
    <>
      <Grid alignItems='center' color={disabled ? '#4B4B4B' : 'inherit'} container item justifyContent='space-between' my='4px' onClick={disabled ? noop : onClick} pl={pl} py={py} sx={{ cursor: disabled ? 'default' : 'pointer', ...(withHoverEffect ? hoverEffectStyles : {}) }} textAlign='left' xs={12}>
        <Grid alignItems='center' container item sx={{ flexWrap: 'nowrap' }} xs>
          <Grid alignItems='center' container item xs={1}>
            {iconComponent ??
              <Box
                alt={'logo'}
                color={disabled ? '#4B4B4B' : 'inherit'}
                component='img'
                src={icon}
                sx={{ '> img': { objectFit: 'scale-down' }, borderRadius: 0, height: '18px', width: '18px' }}
              />
            }
          </Grid>
          <Grid item pl='10px' xs>
            <Typography
              color={disabled ? 'text.disabled' : 'inherit'}
              fontSize={fontSize || '18px'}
              fontWeight={300}
              lineHeight='20px'
              whiteSpace='nowrap'
            >
              {text}
            </Typography>
          </Grid>
        </Grid>
        <Grid alignItems='center' container item sx={{ display: children || showChevron ? 'inherit' : 'none' }} xs={1}>
          <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 18, m: 'auto', stroke: theme.palette.secondary.light, strokeWidth: '2px', transform: showChevron ? 'none' : (showSubMenu ? 'rotate(-90deg)' : 'rotate(90deg)'), transitionDuration: '0.3s', transitionProperty: 'transform' }} />
        </Grid>
      </Grid>
      {
        children
      }
    </>
  );
}
