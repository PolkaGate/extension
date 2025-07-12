// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, type SxProps, type Theme, Typography } from '@mui/material';
import { Unlock } from 'iconsax-react';
import React, { useCallback } from 'react';

import { updateStorage } from '@polkadot/extension-polkagate/src/components/Loading';

import { useExtensionLockContext } from '../../../../context/ExtensionLockContext';
import { useAutoLockPeriod, useIsDark, useIsLoginEnabled, useTranslation } from '../../../../hooks';
import { lockExtension } from '../../../../messaging';

export default function Lock ({ isExtension, style }: { isExtension: boolean, style: SxProps<Theme> }): React.ReactElement {
  const { t } = useTranslation();
  const isDark = useIsDark();
  const autoLockPeriod = useAutoLockPeriod();

  const isLoginEnabled = useIsLoginEnabled();
  const { setExtensionLock } = useExtensionLockContext();

  const onClick = useCallback((): void => {
    if (!isLoginEnabled || autoLockPeriod === undefined) {
      return;
    }

    updateStorage('loginInfo', { lastLoginTime: Date.now() - autoLockPeriod }).then(() => {
      setExtensionLock(true);
      lockExtension().catch(console.error);
    }).catch(console.error);
  }, [autoLockPeriod, isLoginEnabled, setExtensionLock]);

  return (
    <Grid
      alignItems='center' container item justifyContent='center' justifyItems='center' onClick={onClick}
      sx={{ ...style }}
    >
      <Unlock color={isLoginEnabled ? isDark ? '#AA83DC' : '#745D8B' : 'grey'} size={18} variant='Bulk' />
      {
        isExtension &&
        <Typography color={isLoginEnabled ? 'text.primary' : 'grey'} pl='3px' pt='3px' variant='B-4'>
          {t('Lock')}
        </Typography>
      }
    </Grid>
  );
}
