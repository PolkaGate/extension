// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, Grid, Typography } from '@mui/material';
import { Category, User } from 'iconsax-react';
import React from 'react';

import { noop } from '@polkadot/util';

import { logoTransparent } from '../../assets/logos';
import { ActionCard } from '../../components';
import { useTranslation } from '../../hooks';
import { Version2 } from '../../partials';
import { EXTENSION_NAME } from '../../util/constants';
import ActionRow from './partials/ActionRow';
import Socials from './partials/Socials';

function Introduction (): React.ReactElement {
  return (
    <Grid alignItems='center' columnGap='5px' container item sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '46px', px: '10px' }}>
      <Box
        component='img'
        src={logoTransparent as string}
        sx={{ width: 36 }}
      />
      <Grid alignItems='baseline' columnGap='5px' container item width='fit-content'>
        <Typography color='text.primary' fontFamily='Eras' fontSize='18px' fontWeight={400}>
          {EXTENSION_NAME}
        </Typography>
        <Version2
          showLabel={false}
          style={{
            padding: 0,
            paddingLeft: '10px',
            width: 'fit-content'
          }}
        />
      </Grid>
    </Grid>
  );
}

function Settings (): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Container>
      <Grid container item sx={{ border: '4px solid', borderColor: '#1B133C', borderRadius: '14px', mt: '10px', position: 'relative' }}>
        <Introduction />
        <ActionRow />
      </Grid>
      <ActionCard
        Icon={User}
        description={t('Authorized dApps, alerts, identification type, export all accounts')}
        iconWithBackground
        onClick={noop}
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
        onClick={noop}
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
        onClick={noop}
        style={{
          height: ' 85px',
          mt: '10px'
        }}
        title={t('About PolkaGate')}
      />
      <Socials />
    </Container>
  );
}

export default (Settings);
