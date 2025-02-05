// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, Grid } from '@mui/material';
import { Category, User } from 'iconsax-react';
import React, { useCallback, useContext } from 'react';

import { ActionCard, ActionContext } from '../../components';
import { useTranslation } from '../../hooks';
import { UserDashboardHeader } from '../../partials';
import HomeMenu from '../../partials/HomeMenu';
import ActionRow from './partials/ActionRow';
import Introduction from './partials/Introduction';
import Socials from './partials/Socials';

enum SETTING_PAGES {
  ABOUT = 'about',
  ACCOUNT = 'account',
  EXTENSION = 'extension'
}

function Settings (): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const onClick = useCallback((input: SETTING_PAGES) => {
    return () => onAction(`/settings-${input}`);
  }, [onAction]);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <Container>
        <Grid container item sx={{ border: '4px solid', borderColor: '#1B133C', borderRadius: '14px', mt: '10px', position: 'relative' }}>
          <Introduction />
          <ActionRow />
        </Grid>
        <ActionCard
          Icon={User}
          description={t('Authorized dApps, alerts, identification type, export all accounts')}
          iconWithBackground
          onClick={onClick(SETTING_PAGES.ACCOUNT)}
          style={{
            height: ' 85px',
            mt: '10px'
          }}
          title={t('Account Settings')}
        />
        <ActionCard
          Icon={Category}
          description={t('Testnets, chains, auto-lock timer, QR camera, appearance, language')}
          iconWithBackground
          onClick={onClick(SETTING_PAGES.EXTENSION)}
          style={{
            height: ' 85px',
            mt: '10px'
          }}
          title={t('Extension Settings')}
        />
        <ActionCard
          description={t('Privacy Policy, docs, extension version, social media, website extension')}
          iconWithBackground
          logoIcon
          onClick={onClick(SETTING_PAGES.ABOUT)}
          style={{
            height: ' 85px',
            mt: '10px'
          }}
          title={t('About PolkaGate')}
        />
        <Socials />
      </Container>
      <HomeMenu />
    </Container>
  );
}

export default (Settings);
