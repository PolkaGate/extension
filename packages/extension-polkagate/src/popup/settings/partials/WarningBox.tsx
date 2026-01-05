// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack, Typography } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React from 'react';

interface Props {
  title: string;
  description?: string;
}

export default function WarningBox ({ description, title }: Props): React.ReactElement {
  return (
    <Stack columnGap='10px' direction='row' sx={{ bgcolor: '#05091C', borderRadius: '14px', mb: '5px', overflow: 'hidden', p: '15px', position: 'relative' }}>
      <Box sx={{ bgcolor: '#FFCE4F', borderRadius: '50%', filter: 'blur(24px)', height: '32px', opacity: 0.9, position: 'absolute', transform: 'translate(-35%, -35%)', width: '32px' }} />
      <Warning2 color='#FFCE4F' size='24px' style={{ marginTop: '10px' }} variant='Bold' />
      <Stack alignContent='flex-start' direction='column' justifyContent='start' width='100%'>
        <Typography color='#FFFFFF' lineHeight='19.94px' textAlign='start' variant='H-4'>
          {title}
        </Typography>
        <Typography color='text.secondary' sx={{ lineHeight: '16.8px' }} textAlign='start' variant='B-4'>
          {description || ''}
        </Typography>
      </Stack>
    </Stack>
  );
}
