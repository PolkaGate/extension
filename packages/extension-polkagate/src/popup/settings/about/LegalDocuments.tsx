// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import { ExportSquare } from 'iconsax-react';
import React, { useCallback } from 'react';

import { PRIVACY_POLICY_LINK } from '../../../util/constants';

interface Props {
  label: string;
  link: string;
}

function Item ({ label, link }: Props): React.ReactElement {
  const goToLink = useCallback(() => window.open(link, '_blank'), [link]);

  return (
    <Stack direction='row' justifyContent='start' onClick={goToLink} sx={{ cursor: 'pointer' }}>
      <Typography color='text.primary' sx={{ pr: '4px', textAlign: 'left' }} variant='B-1'>
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
        color='label.secondary'
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
          link={PRIVACY_POLICY_LINK}
        />
        <Item
          label='User Agreement'
          link={PRIVACY_POLICY_LINK}
        />
      </Grid>
    </Stack>
  );
}
