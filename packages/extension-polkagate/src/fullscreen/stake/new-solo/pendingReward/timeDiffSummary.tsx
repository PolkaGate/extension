// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import React from 'react';

export function timeDiffSummary (inputDateStr: string, isExtension?: boolean): React.ReactNode {
  const inputDate = new Date(inputDateStr);
  const now = new Date();

  if (isNaN(inputDate.getTime())) {
    return (
      <Typography color='primary.main' variant='B-2'>
      -
      </Typography>
    );
  }

  const diffMs = inputDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return (
      <Typography color='primary.main' variant='B-2'>
        Expired
      </Typography>
    );
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffHours / 24);
  const hours = diffHours % 24;
  const dhColor = isExtension ? 'text.highlight' : 'primary.main';

  return (
    <Stack alignItems='center' direction='row' spacing={0.5}>
      <Typography color='text.primary' variant='B-2'>
        {days}
      </Typography>
      <Typography color={dhColor} variant='B-2'>
        d
      </Typography>
      <Typography color='text.primary' variant='B-2'>
        {hours}
      </Typography>
      <Typography color={dhColor} variant='B-2'>
        h
      </Typography>
    </Stack>);
}
