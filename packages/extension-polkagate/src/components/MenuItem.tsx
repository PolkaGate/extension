// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Box, Grid, Typography } from '@mui/material';
import React, { MouseEventHandler } from 'react';

interface Props {
  disabled?: boolean;
  icon?: string;
  iconComponent?: JSX.Element;
  text: string;
  children?: React.ReactElement<Props>;
  onClick?: MouseEventHandler<HTMLDivElement>;
  showSubMenu?: boolean;
  py?: string;
  pl?: string;
}

export default function MenuItem({ children, disabled = false, icon, iconComponent, onClick, pl = '0', py = '8px', showSubMenu = false, text }: Props): React.ReactElement<Props> {
  return (
    <>
      <Grid alignItems='center' color={disabled ? '#4B4B4B' : 'inherit'} container item justifyContent='space-between' my='4px' onClick={disabled ? () => null : onClick} pl={pl} py={py} sx={{ cursor: disabled ? '' : 'pointer' }} textAlign='left' xs={12}>
        <Grid alignItems='center' container item xs>
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
          <Grid item pl='10px'>
            <Typography
              color={disabled ? 'text.disabled' : 'inherit'}
              fontSize='18px'
              fontWeight={300}
              lineHeight='20px'
            >
              {text}
            </Typography>
          </Grid>
        </Grid>
        <Grid alignItems='center' container item sx={{ display: children ? 'inherit' : 'none' }} xs={1}>
          <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 18, m: 'auto', stroke: '#BA2882', strokeWidth: '2px', transform: showSubMenu ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }} />
        </Grid>
      </Grid>
      {
        children
      }
    </>
  );
}
