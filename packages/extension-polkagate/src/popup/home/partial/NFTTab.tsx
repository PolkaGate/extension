// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TabProps } from './AssetTabs';

import { Container, Typography, useTheme } from '@mui/material';
import { Triangle } from 'iconsax-react';
import React, { memo } from 'react';

import { useTranslation } from '../../../hooks';

function NFTTab ({ isSelected = false }: TabProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '3px', cursor: 'pointer', display: 'flex', width: 'fit-content' }}>
      <Triangle color={isSelected ? theme.palette.menuIcon.selected : theme.palette.menuIcon.active} size='16' variant='Bulk' />
      <Typography color={isSelected ? 'text.primary' : 'secondary.main'} textTransform='capitalize' variant='B-2'>
        {t('NFTs')}
      </Typography>
    </Container>
  );
}

export default memo(NFTTab);
