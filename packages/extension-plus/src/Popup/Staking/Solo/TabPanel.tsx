// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

import { Box, Typography } from '@mui/material';
import React from 'react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  padding?: number;
}

export default function TabPanel(props: TabPanelProps): React.ReactElement {
  const { children, index, padding, value, ...other } = props;

  return (
    <div aria-labelledby={`tab-${index}`} hidden={value !== index} id={`tabpanel-${index}`} role='tabpanel' {...other}>
      {value === index && (
        <Box sx={{ p: padding || 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
