// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import { faDiscord, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Grid, Typography } from '@mui/material';
import React from 'react';

import { DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { riot } from '../../../assets/icons';
import { useTranslation } from '../../../components/translate';

interface IdentityItemsProps {
  icon?: any;
  title: string;
  value: string | null;
  noBorder?: boolean;
}

interface Props {
  identity: DeriveAccountRegistration;
}

export default function DisplayIdentityInformation({ identity }: Props): React.ReactElement {
  const { t } = useTranslation();

  const IdentityItems = ({ icon, noBorder = false, title, value }: IdentityItemsProps) => (
    <Grid alignItems='center' bgcolor={!value ? '#F3EDF1' : ''} container height='45px' item justifyContent='space-between' sx={noBorder ? {} : { borderBottom: '2px solid', borderBottomColor: '#D5CCD0' }}>
      <Grid container item width='fit-content'>
        {icon}
        <Typography fontSize='20px' fontWeight={400} pl={icon ? '8px' : 0}>
          {title}
        </Typography>
      </Grid>
      <Typography fontSize='20px' fontWeight={700} maxWidth='70%' overflow='hidden' textOverflow='ellipsis'>
        {value ?? t<string>('Not set yet.')}
      </Typography>
    </Grid>
  );

  return (
    <Grid container item sx={{ bgcolor: 'background.paper', borderRadius: '10px', boxShadow: '2px 3px 4px 0px #0000001A', display: 'block', height: 'fit-content', p: '5px 25px' }}>
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
          <Box component='img' src={riot as string} sx={{ height: '25px', mb: '2px', width: '25px' }} />
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
