// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Avatar, Grid, Typography } from '@mui/material';
import React, { MouseEventHandler } from 'react';

interface Props {
  disabled?: boolean;
  icon?: string;
  vaadinIcon?: JSX.Element;
  text: string;
  children?: React.ReactElement<Props>;
  onClick?: MouseEventHandler<HTMLDivElement>;
  showSubMenu?: boolean;
  py?: string;
}

export default function MenuItem({ children, disabled = false, icon, onClick, py = '8px', showSubMenu = false, text, vaadinIcon }: Props): React.ReactElement<Props> {
  return (
    <>
      <Grid
        alignItems='center'
        container
        item
        justifyContent='space-between'
        my='4px'
        onClick={disabled ? () => null : onClick}
        py={py}
        sx={{ cursor: disabled ? '' : 'pointer' }}
        textAlign='left'
        xs={12}
        color={disabled ? '#4B4B4B' : 'inherit'}
      >
        <Grid
          container
          item
          xs
        >
          <Grid
            alignItems='center'
            container
            item
            xs={1}
          >
            {vaadinIcon ??
              <Avatar
                alt={'logo'}
                color={disabled ? '#4B4B4B' : 'inherit'}
                src={icon}
                sx={{ '> img': { objectFit: 'scale-down' }, borderRadius: 0, height: '18px', width: '18px' }}
              />
            }
          </Grid>
          <Grid
            item
            pl='10px'
          // xs={10}
          >
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
        <Grid
          alignItems='center'
          container
          item
          sx={{ display: children ? 'inherit' : 'none' }}
          xs={1}
        >
          <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 18, m: 'auto', stroke: '#BA2882', strokeWidth: '2px', transform: showSubMenu ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
        </Grid>
      </Grid>
      {
        showSubMenu && children
      }
    </>
  );
}
