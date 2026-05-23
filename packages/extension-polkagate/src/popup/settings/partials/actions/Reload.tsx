// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { Refresh2 } from 'iconsax-react';
import React from 'react';

import { useTranslation } from '../../../../hooks/index';

function onReload() {
  // eslint-disable-next-line no-undef
  chrome.runtime.reload();
}

export default function Reload({ isExtension, style }: { isExtension: boolean, style: SxProps<Theme> }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Grid alignItems='center' container item justifyContent='center' justifyItems='center' onClick={onReload} sx={{ ...style }}>
      <Refresh2 color={theme.palette.accent.icon} size={18} variant='Bold' />
      {
        isExtension &&
        <Typography color='text.primary' pl='3px' pt='3px' variant='B-4'>
          {t('Reload')}
        </Typography>}
    </Grid>
  );
}
