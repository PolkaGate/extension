// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Typography } from '@mui/material';
import React from 'react';

import { safeBox, safeBoxLight } from '../assets/icons';
import { useIsDark, useTranslation } from '../hooks';

const AssetNull = ({ text }: {text?: string}) => {
  const { t } = useTranslation();
  const isDark = useIsDark();

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'grid', justifyItems: 'center', py: '33px', width: '100%' }}>
      <Box
        component='img'
        src={(isDark ? safeBox : safeBoxLight) as string}
        sx={{ width: '135px' }}
      />
      <Typography color='#BEAAD8' pt='10px' variant='B-2'>
        {text ?? t("You don't have any tokens yet")}
      </Typography>
    </Container>
  );
};

export default AssetNull;
