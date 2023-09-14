// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faDiscord, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { riot } from '../../../assets/icons';
import { useTranslation } from '../../../components/translate';

interface IdentityItemsProps {
  icon?: unknown;
  title: string;
  value: string | null;
  noBorder?: boolean;
}

interface Props {
  identity: DeriveAccountRegistration;
}

export default function DisplayIdentityInformation({ identity }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const emptyFieldColor = useMemo(() => theme.palette.mode === 'light' ? '#F3EDF1' : '#212121', [theme.palette.mode]);

  const IdentityItems = ({ icon, noBorder = false, title, value }: IdentityItemsProps) => (
    <Grid alignItems='center' bgcolor={!value ? emptyFieldColor : ''} container height='45px' item justifyContent='space-between' px='7px' sx={noBorder ? {} : { borderBottom: '2px solid', borderBottomColor: '#D5CCD0' }}>
      <Grid container item width='fit-content'>
        {icon}
        <Typography fontSize='18px' fontWeight={400} pl={icon ? '8px' : 0}>
          {title}
        </Typography>
      </Grid>
      <Typography fontSize='18px' fontWeight={value ? 700 : 400} maxWidth='70%' overflow='hidden' textOverflow='ellipsis'>
        {value ?? t<string>('Not set yet.')}
      </Typography>
    </Grid>
  );

  return (
    <Grid container item sx={{ bgcolor: 'background.paper', boxShadow: theme.palette.mode === 'dark' ? '0px 4px 4px rgba(255, 255, 255, 0.25)' : '0px 4px 4px 0px rgba(0, 0, 0, 0.25)', display: 'block', height: 'fit-content', p: '8px 18px' }}>
      <IdentityItems
        title={t<string>('Display Name')}
        value={identity.display ?? null}
      />
      <IdentityItems
        title={t<string>('Legal Name')}
        value={identity.legal ?? null}
      />
      <IdentityItems
        icon={
          <FontAwesomeIcon
            color='#007CC4'
            fontSize='30px'
            icon={faGlobe}
          />
        }
        title={t<string>('Website')}
        value={identity.web ?? null}
      />
      <IdentityItems
        icon={
          <FontAwesomeIcon
            color='#1E5AEF'
            fontSize='30px'
            icon={faEnvelope}
          />
        }
        title={t<string>('Email')}
        value={identity.email ?? null}
      />
      <IdentityItems
        icon={
          <FontAwesomeIcon
            color='#2AA9E0'
            fontSize='30px'
            icon={faTwitter}
          />
        }
        title={t<string>('Twitter')}
        value={identity.twitter ?? null}
      />
      <IdentityItems
        icon={
          <Box component='img' src={riot as string} sx={{ height: '30px', mb: '2px', width: '30px' }} />
        }
        title={t<string>('Element')}
        value={identity.riot ?? null}
      />
      <IdentityItems
        icon={
          <FontAwesomeIcon
            color='#5865F2'
            fontSize='30px'
            icon={faDiscord}
          />
        }
        noBorder
        title={t<string>('Discord')}
        value={identity.other?.discord ?? null}
      />
    </Grid>
  );
}
