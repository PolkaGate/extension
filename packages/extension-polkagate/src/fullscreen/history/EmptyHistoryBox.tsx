// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Typography } from '@mui/material';
import React, { memo } from 'react';

import { emptyHistoryList } from '../../assets/icons/index';
import { useTranslation } from '../../hooks';

function EmptyHistoryBox () {
  const { t } = useTranslation();

  return (
    <>
      <Box
        component='img'
        src={emptyHistoryList as string}
        sx={{ height: 'auto', m: '30px auto 15px', width: '125px' }}
      />
      <Typography color='text.secondary' mb='30px' variant='B-2'>
        {t('No transaction history is available yet')}
      </Typography>
    </>
  );
}

export default memo(EmptyHistoryBox);
