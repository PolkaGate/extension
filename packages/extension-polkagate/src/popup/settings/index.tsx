// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid } from '@mui/material';
import { Category, User } from 'iconsax-react';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { ActionCard, Motion } from '../../components';
import { useIsDark, useSelectedAccount, useTranslation } from '../../hooks';
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
  const isDark = useIsDark();
  const navigate = useNavigate();
  const account = useSelectedAccount();

  const onClick = useCallback((input: SETTING_PAGES) => {
    const path = input === SETTING_PAGES.ACCOUNT
      ? `/settings-${input}/${account?.address ?? ''}`
      : `/settings-${input}/`;

    return () => navigate(path) as void;
  }, [account?.address, navigate]);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <UserDashboardHeader fullscreenURL='/settingsfs/' homeType='default' />
      <Motion style={{ padding: '0 10px' }} variant='slide'>
        <Grid container item sx={{ bgcolor: isDark ? '#1B133C' : '#F5F4FF', borderRadius: '14px', mt: '10px', p: '4px', position: 'relative' }}>
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
        <Socials label={t('STAY TUNED')} />
      </Motion>
      <HomeMenu />
    </Container>
  );
}

export default (Settings);
