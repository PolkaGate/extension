// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import { ExportSquare } from 'iconsax-react';
import React, { useCallback } from 'react';

interface Props {
  label: string;
  link: string;
}

function Item ({ label, link }: Props): React.ReactElement {
  const goToLink = useCallback(() => window.open(link, '_blank'), [link]);

  return (
    <Stack direction='row' justifyContent='start' sx={{ cursor: 'pointer' }} onClick={goToLink}>
      <Typography color='text.primary' sx={{ textAlign: 'left', pr: '4px' }} variant='B-1'>
        {label}
      </Typography>
      <ExportSquare color='#AA83DC' size={18} variant='Bulk' />
    </Stack>
  );
}

export default function LegalDocuments (): React.ReactElement {
  return (
    <Stack direction='column'>
      <Typography
        color='rgba(190, 170, 216, 1)'
        mb='8px'
        mt='10px'
        sx={{ display: 'block', textAlign: 'left' }}
        variant='H-4'>
        LEGAL DOCUMENTS
      </Typography>
      <Grid
        columnGap='8px'
        container
        justifyContent={'flex-start'}
      >
        <Item
          label='Privacy Policy'
          link='https://docs.polkagate.xyz/polkagate/polkagate-extension-user-guide/legal-and-security/privacy-policy'
        />
        <Item
          label='User Agreement'
          link='https://docs.polkagate.xyz/polkagate/polkagate-extension-user-guide/legal-and-security/privacy-policy'
        />
      </Grid>
    </Stack>
  );
}
