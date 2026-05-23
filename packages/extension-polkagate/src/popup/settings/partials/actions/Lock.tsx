// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { Unlock } from 'iconsax-react';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useExtensionLockContext } from '../../../../context/ExtensionLockContext';
import { useAutoLockPeriod, useTranslation } from '../../../../hooks';
import { lockExtension } from '../../../../messaging';

export default function Lock({ isExtension, style }: { isExtension: boolean, style: SxProps<Theme> }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const autoLockPeriod = useAutoLockPeriod();

  const { setExtensionLock } = useExtensionLockContext();

  const onClick = useCallback((): void => {
    if (autoLockPeriod === undefined) {
      return;
    }

    setExtensionLock(true);
    navigate('/') as void;
    lockExtension().catch(console.error);
  }, [autoLockPeriod, navigate, setExtensionLock]);

  return (
    <Grid
      alignItems='center' container item justifyContent='center' justifyItems='center' onClick={onClick}
      sx={{ ...style }}
    >
      <Unlock color={theme.palette.accent.icon} size={18} variant='Bulk' />
      {
        isExtension &&
        <Typography color='text.primary' pl='3px' pt='3px' variant='B-4'>
          {t('Lock')}
        </Typography>
      }
    </Grid>
  );
}
