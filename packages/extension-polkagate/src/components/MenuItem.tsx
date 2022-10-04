// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Avatar, Grid, Typography } from '@mui/material';
import React, { MouseEventHandler } from 'react';

interface Props {
  Icon: string;
  text: string;
  hasSubMenu?: boolean;
  onClick: MouseEventHandler<HTMLDivElement>;
}

export default function MenuItem ({ Icon, hasSubMenu = false, onClick, text }: Props): React.ReactElement<Props> {
  return (
    <Grid
      alignItems='center'
      container
      item
      justifyContent='space-between'
      my='4px'
      onClick={onClick}
      py='8px'
      sx={{ cursor: 'pointer' }}
      textAlign='left'
      xs={12}
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
          sx={{ '> img': { objectFit: 'scale-down' }, borderRadius: 0, height: '16px', width: '16px' }}
        />
      </Grid>
      <Grid
        item
        pl='10px'
        xs={10}
      >
        <Typography
          fontSize='18px'
          fontWeight={300}
          lineHeight='20px'
        >
          {text}
        </Typography>
      </Grid>
      <Grid
        alignItems='center'
        container
        item
        sx={{ opacity: hasSubMenu ? '100' : '0' }}
        xs={1}
      >
        <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 18, m: 'auto', stroke: '#BA2882', strokeWidth: '2px', transform: 'rotate(90deg)' }} />
      </Grid>
    </Grid>
  );
}
