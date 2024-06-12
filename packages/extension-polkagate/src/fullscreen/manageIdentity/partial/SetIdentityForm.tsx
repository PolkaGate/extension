// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import { faDiscord, faGithub, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Grid, useTheme } from '@mui/material';
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
  setMatrix: React.Dispatch<React.SetStateAction<string | undefined>>;
  setRiot: React.Dispatch<React.SetStateAction<string | undefined>>;
  setGithub: React.Dispatch<React.SetStateAction<string | undefined>>;
  setDiscord: React.Dispatch<React.SetStateAction<string | undefined>>;
  display: string | undefined;
  legal: string | undefined;
  email: string | undefined;
  web: string | undefined;
  github: string | undefined;
  twitter: string | undefined;
  matrix: string | undefined;
  riot: string | undefined;
  discord: string | undefined;
  isPeopleChainEnabled: boolean
}

export default function SetIdentityForm({ discord, display, email, github, identity, isPeopleChainEnabled, legal, matrix, riot, setDiscord, setDisplay, setEmail, setGithub, setLegal, setMatrix, setRiot, setTwitter, setWeb, twitter, web }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Grid container item sx={{ borderBottom: '2px solid', borderBottomColor: '#D5CCD0', display: 'block', height: 'fit-content', py: '20px' }}>
      <IdentityInfoInput
        setter={setDisplay}
        title={t('Display Name (Mandatory)')}
        value={display ?? identity?.display}
      />
      <IdentityInfoInput
        setter={setLegal}
        title={t('Legal Name')}
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
        title={t('Email')}
        type='email'
        value={email ?? identity?.email}
      />
      <IdentityInfoInput
        icon={
          <FontAwesomeIcon
            color={theme.palette.success.main}
            fontSize='30px'
            icon={faGlobe}
          />
        }
        setter={setWeb}
        title={t('Website')}
        type='url'
        value={web ?? identity?.web}
      />
      <IdentityInfoInput
        icon={
          <FontAwesomeIcon
            color={isDark ? 'white' : 'black'}
            fontSize='30px'
            icon={faXTwitter}
          />
        }
        setter={setTwitter}
        title={t('X')}
        value={twitter ?? identity?.twitter}
      />
      <IdentityInfoInput
        icon={
          <Box component='img' src={riotIcon as string} sx={{ height: '30px', mb: '2px', width: '30px' }} />
        }
        setter={isPeopleChainEnabled ? setMatrix : setRiot}
        title={t('Element')}
        value={isPeopleChainEnabled
          ? matrix ?? identity?.matrix as string
          : riot || identity?.riot
        }
      />
      {isPeopleChainEnabled &&
        <IdentityInfoInput
          icon={
            <FontAwesomeIcon
              color='rgb(178, 58, 120)'
              fontSize='30px'
              icon={faGithub}
            />}
          setter={setGithub}
          title={t('Github')}
          value={github ?? identity?.github as string}
        />
      }
      <IdentityInfoInput
        icon={
          <FontAwesomeIcon
            color='#5865F2'
            fontSize='30px'
            icon={faDiscord}
          />
        }
        setter={setDiscord}
        title={t('Discord')}
        value={isPeopleChainEnabled
          ? discord || identity?.discord as string
          : discord || identity?.other?.discord
        }
      />
    </Grid>
  );
}
