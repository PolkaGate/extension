// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Avatar, Grid, Typography } from '@mui/material';
import React, { MouseEventHandler } from 'react';

interface Props {
  Icon: string;
  text: string;
  children?: React.ReactElement<Props>;
  onClick?: MouseEventHandler<HTMLDivElement>;
  showSubMenu?: boolean;
  py?: string;
}

export default function MenuItem({ Icon, children, onClick, text, py = '8px', showSubMenu = false }: Props): React.ReactElement<Props> {
  return (
    <>
      <Grid
        alignItems='center'
        container
        item
        justifyContent='space-between'
        my='4px'
        onClick={onClick}
        py={py}
        sx={{ cursor: 'pointer' }}
        textAlign='left'
        xs={12}
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
            <Avatar
              alt={'logo'}
              src={Icon}
              sx={{ '> img': { objectFit: 'scale-down' }, borderRadius: 0, height: '18px', width: '18px' }}
            />
          </Grid>
          <Grid
            item
            pl='10px'
          // xs={10}
          >
            <Typography
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
