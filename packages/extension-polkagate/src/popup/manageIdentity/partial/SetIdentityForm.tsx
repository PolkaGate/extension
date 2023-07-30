// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import { faDiscord, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Grid } from '@mui/material';
import React from 'react';

import { DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { riot as riotIcon } from '../../../assets/icons';
import { useTranslation } from '../../../components/translate';
import IdentityInfoInput from './IdentityInfoInput';

interface Props {
  identity?: DeriveAccountRegistration | null;
  setDisplay: React.Dispatch<React.SetStateAction<string | undefined>>;
  setLegal: React.Dispatch<React.SetStateAction<string | undefined>>;
  setEmail: React.Dispatch<React.SetStateAction<string | undefined>>;
  setWeb: React.Dispatch<React.SetStateAction<string | undefined>>;
  setTwitter: React.Dispatch<React.SetStateAction<string | undefined>>;
  setRiot: React.Dispatch<React.SetStateAction<string | undefined>>;
  setDiscord: React.Dispatch<React.SetStateAction<string | undefined>>;
  display: string | undefined;
  legal: string | undefined;
  email: string | undefined;
  web: string | undefined;
  twitter: string | undefined;
  riot: string | undefined;
  discord: string | undefined;
}

export default function SetIdentityForm ({ discord, display, email, identity, legal, riot, setDiscord, setDisplay, setEmail, setLegal, setRiot, setTwitter, setWeb, twitter, web }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Grid container item sx={{ borderBottom: '2px solid', borderBottomColor: '#D5CCD0', display: 'block', height: 'fit-content', py: '20px' }}>
      <IdentityInfoInput
        setter={setDisplay}
        title={t<string>('Display Name (Mandatory)')}
        value={display ?? identity?.display}
      />
      <IdentityInfoInput
        setter={setLegal}
        title={t<string>('Legal Name')}
        value={legal ?? identity?.legal}
      />
      <IdentityInfoInput
        icon={
          <FontAwesomeIcon
            color='#1E5AEF'
            fontSize='30px'
            icon={faEnvelope}
          />
        }
        setter={setEmail}
        title={t<string>('Email')}
        type='email'
        value={email ?? identity?.email}
      />
      <IdentityInfoInput
        icon={
          <FontAwesomeIcon
            color='#007CC4'
            fontSize='30px'
            icon={faGlobe}
          />
        }
        setter={setWeb}
        title={t<string>('Website')}
        type='url'
        value={web ?? identity?.web}
      />
      <IdentityInfoInput
        icon={
          <FontAwesomeIcon
            color='#2AA9E0'
            fontSize='30px'
            icon={faTwitter}
          />
        }
        setter={setTwitter}
        title={t<string>('Twitter')}
        value={twitter ?? identity?.twitter}
      />
      <IdentityInfoInput
        icon={
          <Box component='img' src={riotIcon as string} sx={{ height: '25px', mb: '2px', width: '25px' }} />
        }
        setter={setRiot}
        title={t<string>('Element')}
        value={riot ?? identity?.riot}
      />
      <IdentityInfoInput
        icon={
          <FontAwesomeIcon
            color='#5865F2'
            fontSize='30px'
            icon={faDiscord}
          />
        }
        setter={setDiscord}
        title={t<string>('Discord')}
        value={discord ?? identity?.other?.discord}
      />
    </Grid>
  );
}
