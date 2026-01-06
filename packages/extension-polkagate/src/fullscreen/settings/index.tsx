// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import React, { memo, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import ActionRow from '@polkadot/extension-polkagate/src/popup/settings/partials/ActionRow';

import { useTranslation } from '../../hooks';
import { VelvetBox } from '../../style';
import HomeLayout from '../components/layout';
import TopMenus from './partials/TopMenus';
import About from './About';
import AccountSettings from './AccountSettings';
import ExtensionSettings from './ExtensionSettings';
import NetworkSettings from './NetworkSettings';

function Settings(): React.ReactElement {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const { genesisHash } = useParams<{ address: string, genesisHash: string }>();

  const content = useMemo(() => {
    const routeComponents: Record<string, React.ReactNode> = {
      '/settingsfs/': <ExtensionSettings />,
      '/settingsfs/about': <About />,
      '/settingsfs/account': <AccountSettings />,
      '/settingsfs/network': <NetworkSettings />
    };

    return routeComponents[pathname] ?? null;
  }, [pathname]);

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
          {content}
        </Grid>
      </VelvetBox>
    </HomeLayout>
  );
}

export default memo(Settings);
