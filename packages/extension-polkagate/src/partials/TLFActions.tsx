// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import LockIcon from '@mui/icons-material/Lock';
import { Divider, Grid, IconButton } from '@mui/material';
import React, { useCallback } from 'react';

import { FullScreenIcon, Infotip2 } from '../components';
import { updateStorage } from '../components/Loading';
import { useExtensionLockContext } from '../context/ExtensionLockContext';
import ThemeChanger from '../fullscreen/governance/partials/ThemeChanger';
import { useIsLoginEnabled, useTranslation } from '../hooks';
import { lockExtension } from '../messaging';
import { NO_PASS_PERIOD } from '../util/constants';

const TLFActions = () => {
  const { t } = useTranslation();

  const isLoginEnabled = useIsLoginEnabled();
  const { setExtensionLock } = useExtensionLockContext();

  const onLockExtension = useCallback((): void => {
    updateStorage('loginInfo', { lastLoginTime: Date.now() - NO_PASS_PERIOD }).then(() => {
      setExtensionLock(true);
      lockExtension().catch(console.error);
    }).catch(console.error);
  }, [setExtensionLock]);

  return (
    <Grid alignItems='center' container item justifyContent='flex-end' spacing={4} py='5px' mr='13px'>
      {isLoginEnabled &&
        <>
          <Grid container item width='fit-content'>
            <Infotip2
              text={t('Lock Extension')}
            >
              <IconButton
                onClick={onLockExtension}
                sx={{ height: '35px', ml: '-5px', p: 0, width: '35px' }}
              >
                <LockIcon sx={{ color: 'secondary.light', cursor: 'pointer', fontSize: '27px' }} />
              </IconButton>
            </Infotip2>
          </Grid>
          <Grid item>
            <Divider orientation='vertical' sx={{ bgcolor: 'divider', height: '20px', my: 'auto' }} />
          </Grid>
        </>
      }
      <>
        <Grid item>
          <Infotip2
            text={t('Switch Theme')}
          >
            <IconButton
              sx={{ height: '35px', p: 0, width: '35px' }}
            >
              <ThemeChanger color='secondary.light' noBorder />
            </IconButton>
          </Infotip2>
        </Grid>
      </>
      <Grid item>
        <Divider orientation='vertical' sx={{ bgcolor: 'divider', height: '20px', my: 'auto' }} />
      </Grid>
      <FullScreenIcon isSettingSubMenu url='/' />
    </Grid>
  );
};

export default React.memo(TLFActions);
