// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React from 'react';

interface Props {
  error: string;
  style?: React.CSSProperties;
}

const LedgerErrorMessage = ({ error, style = {} }: Props) => {
  const parts = error.split(/('.*?')/); // Split on the quoted part

  return (
    <Grid alignItems='center' columnGap='5px' container item sx={{ mb: '25px', ...style }}>
      <Warning2 color='#FF4FB9' size='24px' variant='Bold' />
      <Typography sx={{ letterSpacing: '-0.3px', textAlign: 'left', width: '90%' }} variant='B-4'>
        {parts.map((part, index) => (
          part.startsWith("'") && part.endsWith("'")
            ? <span key={index} style={{ color: '#AA83DC' }}>{part}</span> // Color for quoted text
            : <span key={index} style={{ color: '#FF4FB9' }}>{part}</span> // Color for other text
        ))}
      </Typography>
    </Grid>
  );
};

export default React.memo(LedgerErrorMessage);
