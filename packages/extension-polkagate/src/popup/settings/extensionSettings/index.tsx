// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, Grid, Stack } from '@mui/material';
import { Check, I3Dcube, Trade } from 'iconsax-react';
import React, { useCallback, useContext } from 'react';
import { useLocation } from 'react-router';

import { ActionContext, BackWithLabel } from '../../../components';
import { useTranslation } from '../../../hooks';
import { UserDashboardHeader } from '../../../partials';
import HomeMenu from '../../../partials/HomeMenu';
import TopMenuItem from './components/TopMenuItem';
import Chains from './Chains';
import Main from './Main';

function ExtensionSettings (): React.ReactElement {
  const { pathname } = useLocation();

  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const onBack = useCallback(() => onAction('/settings'), [onAction]);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <BackWithLabel
        onClick={onBack}
        text={t('Extension Settings')}
      />
      <Grid container item sx={{ px: '15px' }}>
        <Stack columnGap='20px' direction='row' ml='7px' mt='12px'>
          <TopMenuItem
            Icon={Trade}
            label={t('Main')}
            path=''
          />
          <TopMenuItem
            Icon={I3Dcube}
            label={t('Chains')}
            path='chains'
          />
          <TopMenuItem
            Icon={Check}
            label={t('Password')}
            path='password'
          />
        </Stack>
        <Grid container item sx={{ border: '4px solid #1b143c', borderRadius: '14px', my: '15px' }}>
          <Grid container item sx={{ bgcolor: '#1B133C', borderRadius: '14px', height: '373px', overflow: 'scroll' }}>
            {pathname === '/settings-extension/' && <Main />}
            {pathname === '/settings-extension/chains' && <Chains />}
          </Grid>
        </Grid>
      </Grid>
      <HomeMenu />
    </Container>
  );
}

export default React.memo(ExtensionSettings);
