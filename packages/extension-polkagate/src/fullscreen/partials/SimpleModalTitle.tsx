// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React from 'react';

import { VaadinIcon } from '../../components';

interface Props {
  onClose: () => void;
  title: string;
  vaadinIcon: string;
}

export default function SimpleModalTitle ({ onClose, title, vaadinIcon }: Props): React.ReactElement {
  const theme = useTheme();

  return (
    <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
      <Grid alignItems='center' container item justifyContent='flex-start' width='fit-content'>
        <VaadinIcon icon={`vaadin:${vaadinIcon}`} style={{ color: `${theme.palette.text.primary}`, height: '22px', marginRight: '10px' }} />
        <Typography display='contents' fontSize='22px' fontWeight={700}>
          {title}
        </Typography>
      </Grid>
      <Grid item>
        <CloseIcon onClick={onClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
      </Grid>
      <Divider sx={{ mt: '5px', width: '100%' }} />
    </Grid>
  );
}
