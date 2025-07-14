// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';

import ActionRow from '@polkadot/extension-polkagate/src/popup/settings/partials/ActionRow';

import { useFullscreen, useTranslation } from '../../hooks';
import { VelvetBox } from '../../style';
import HomeLayout from '../components/layout';
import TopMenus from './partials/TopMenus';
import About from './About';
import AccountSettings from './AccountSettings';
import ExtensionSettings from './ExtensionSettings';
import NetworkSettings from './NetworkSettings';

export default function Settings (): React.ReactElement {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  useFullscreen();

  const { genesisHash } = useParams<{ address: string, genesisHash: string }>();

  return (
    <HomeLayout
      childrenStyle={{ paddingLeft: '25px', position: 'relative', zIndex: 1 }}
      genesisHash={genesisHash}
    >
      <Stack direction='row' sx={{ justifyContent: 'space-between', width: '98%' }}>
        <Typography color='text.primary' sx={{ textAlign: 'left', textTransform: 'uppercase', width: '100%' }} variant='H-2'>
          {t('Settings')}
        </Typography>
        <ActionRow />
      </Stack>
      <TopMenus />
      <VelvetBox style={{ margin: '5px 20px 0 0', padding: 0 }}>
        <Grid container item>
          {
            pathname === '/settingsfs/' &&
            <ExtensionSettings />
          }
          {
            pathname === '/settingsfs/account' &&
            <AccountSettings />
          }
          {
            pathname === '/settingsfs/network' &&
            <NetworkSettings />
          }
          {
            pathname === '/settingsfs/about' &&
            <About />
          }
        </Grid>
      </VelvetBox>
    </HomeLayout>
  );
}
