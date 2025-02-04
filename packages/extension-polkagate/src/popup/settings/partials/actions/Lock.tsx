// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import { Unlock } from 'iconsax-react';
import React, { useCallback } from 'react';

import { updateStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { NO_PASS_PERIOD } from '@polkadot/extension-polkagate/src/util/constants';

import { useExtensionLockContext } from '../../../../context/ExtensionLockContext';
import { useIsLoginEnabled, useTranslation } from '../../../../hooks';
import { lockExtension } from '../../../../messaging';

export default function Lock (): React.ReactElement {
  const { t } = useTranslation();

  const isLoginEnabled = useIsLoginEnabled();
  const { setExtensionLock } = useExtensionLockContext();

  const onClick = useCallback((): void => {
    if (!isLoginEnabled) {
      return;
    }

    updateStorage('loginInfo', { lastLoginTime: Date.now() - NO_PASS_PERIOD }).then(() => {
      setExtensionLock(true);
      lockExtension().catch(console.error);
    }).catch(console.error);
  }, [isLoginEnabled, setExtensionLock]);

  return (
    <Grid alignItems='center' container item justifyContent='center' justifyItems='center' onClick={onClick} sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '39px', mt: '2px', width: '110px' }}>
      <Unlock color={isLoginEnabled ? '#AA83DC' : 'grey'} size={18} variant='Bulk' />
      <Typography color={isLoginEnabled ? 'grey' : 'text.primary'} pl='2px' pt='4px' variant='B-4'>
        {t('Lock')}
      </Typography>
    </Grid>
  );
}
