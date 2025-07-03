// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { useFullscreen, useTranslation } from '../../hooks';
import { VelvetBox } from '../../style';
import HomeLayout from '../components/layout';
import TopMenus from './partials/TopMenus';
import ExtensionSettings from './ExtensionSettings';

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
      <Typography color='text.primary' sx={{ textAlign: 'left', textTransform: 'uppercase', width: '100%' }} variant='H-2'>
        {t('Settings')}
      </Typography>
      <TopMenus />
      <VelvetBox style={{ margin: '5px 20px 0 0', padding: 0}}>
        <Grid container item>
          {
            pathname === '/settingsfs/' &&
            <ExtensionSettings />
          }
          {/* {
            pathname === '/settingsfs/chains' &&
                <Chains />
          }
          {
            pathname === '/settingsfs/password' &&
                <ManagePassword />
          } */}
        </Grid>
      </VelvetBox>
    </HomeLayout>
  );
}
