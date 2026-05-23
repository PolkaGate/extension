// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography, useTheme } from '@mui/material';
import { Like1 } from 'iconsax-react';
import React, { useCallback } from 'react';

import { useTranslation } from '@polkadot/extension-polkagate/src/components/translate';

const EXTENSION_URL = 'https://chromewebstore.google.com/detail/polkagate-the-gateway-to/ginchbkmljhldofnbjabmeophlhdldgp';

export default function RateUsButton(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const onClick = useCallback(() => window.open(EXTENSION_URL), []);

  return (
    <Grid
      alignItems='center'
      container
      item
      justifyContent='center'
      justifyItems='center'
      onClick={onClick}
      sx={{
        background: theme.palette.gradient.brand,
        borderRadius: '14px',
        cursor: 'pointer',
        height: '36px',
        mt: '2px',
        position: 'relative',
        width: '141px',
        zIndex: 10
      }}
    >
      <Like1
        color='#EAEBF1'
        cursor='pointer'
        size={18}
        variant='Bulk'
      />
      <Typography
        color='#EAEBF1'
        pl='5px'
        variant='B-2'
      >
        {t('Rate the app')}
      </Typography>
    </Grid>

  );
}
