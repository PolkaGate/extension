// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { Home } from 'iconsax-react';
import React from 'react';

import { useTranslation } from '../../../hooks';

function Bread (): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Stack direction='row' sx={{ height: '24px', m: '20px' }}>
      <Stack columnGap='5px' direction='row'>
        <Home color='#AA83DC' size='18' variant='Bulk' />
        <Typography color='#AA83DC' variant='B-2'>
          {t('Home')}
        </Typography>
      </Stack>
    </Stack>

  );
}

export default React.memo(Bread);
