// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens a header on top of pages except the accounts page
 * */

import { Close as CloseIcon } from '@mui/icons-material';
import { Box, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React from 'react';

import { logoBlack, logoWhite } from '../assets/logos/';

interface Props {
  onClose?: () => void;
  text: string;
}

export default function Header({ onClose, text }: Props): React.ReactElement {
  const theme = useTheme();

  return (
    <Grid alignItems='center' container justifyContent='flex-end' p='15px 30px 11px' sx={{ borderBottom: 0.5, borderColor: 'secondary.light' }}>
      <Grid alignItems='center' container item xs={2}>
        <Box component='img' src={theme.palette.mode === 'dark' ? logoBlack as string : logoWhite as string} sx={{ height: 38, width: 38 }} />
      </Grid>
      <Grid item m='auto' textAlign='center' xs={8}>
        <Typography fontSize='20px' fontWeight={400}>
          {text}
        </Typography>
      </Grid>
      <Grid item textAlign='right' xs={2}>
        {onClose &&
          <IconButton
            aria-label='menu'
            color='inherit'
            edge='start'
            onClick={onClose}
            size='small'
            sx={{ p: '0px' }}
          >
            <CloseIcon sx={{ fontSize: 40 }} />
          </IconButton>
        }
      </Grid>
    </Grid>
  );
}
