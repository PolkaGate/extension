// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import { MessageQuestion } from 'iconsax-react';
import React, { useCallback } from 'react';

import { useTranslation } from '../../hooks';

function NeedHelp (): React.ReactElement {
  const { t } = useTranslation();
  const onClick = useCallback(() => {
    window.open('https://docs.polkagate.xyz', '_blank');
  }, []);

  return (
    <Grid alignItems='center' container item onClick={onClick} sx={{ color: '#674394', cursor: 'pointer' }} width='fit-content' columnGap='10px'>
      <MessageQuestion size='16' variant='Bulk' />
      <Typography variant='B-5'>
        {t('Need Help')}
      </Typography>
    </Grid>
  );
}

export default React.memo(NeedHelp);
