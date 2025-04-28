// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { Home } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useTranslation } from '../../../hooks';

function Bread(): React.ReactElement {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isImport = useMemo(() => ['restore', 'attach', 'import'].some((keyword) => pathname.includes(keyword)), [pathname])

  const onImportClick = useCallback(() => {
    navigate('/account/have-wallet');
  }, [navigate]);

  return (
    <Stack columnGap='20px' direction='row' sx={{ height: '24px', m: '20px' }}>
      <Stack columnGap='5px' direction='row'>
        <Home color='#AA83DC' size='18' variant='Bulk' />
        <Typography color='#AA83DC' variant='B-2'>
          {t('Home')}
        </Typography>
      </Stack>
      {isImport &&
        <Typography color='#AA83DC' onClick={onImportClick} sx={{ cursor: 'pointer' }} variant='B-2'>
          {t('Import account')}
        </Typography>
      }
    </Stack>

  );
}

export default React.memo(Bread);
