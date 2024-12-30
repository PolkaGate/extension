// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, Grid, Typography } from '@mui/material';
import { ArrowDown2, ShieldTick } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { logoTransparent } from '../assets/logos';
import { EXTENSION_NAME } from '../util/constants';
import SelectLanguage from './SelectLanguage';
import PrivacyPolicy from './PrivacyPolicy';

export enum WelcomeHeaderPopups {
  NONE,
  LANGUAGE,
  PRIVACY
}

function WelcomeHeader (): React.ReactElement {
  const [popup, setPopup] = useState<WelcomeHeaderPopups>(WelcomeHeaderPopups.NONE);

  const openLanguage = useCallback(() => {
    setPopup(WelcomeHeaderPopups.LANGUAGE);
  }, [setPopup]);

  const openPrivacy = useCallback(() => {
    setPopup(WelcomeHeaderPopups.PRIVACY);
  }, [setPopup]);

  return (
    <>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', p: '5px 15px', position: 'relative', zIndex: 1 }}>
        <Grid alignItems='center' container item onClick={openPrivacy} sx={{ bgcolor: '#BFA1FF26', borderRadius: '10px', cursor: 'pointer', p: '3px', width: 'fit-content' }}>
          <ShieldTick color='#AA83DC' size='24' variant='Bulk' />
        </Grid>
        <Grid alignItems='center' container item width='fit-content'>
          <Box
            component='img'
            src={logoTransparent as string}
            sx={{ width: 43 }}
          />
          <Typography color='text.primary' fontFamily='Eras' fontSize='20px' fontWeight={400}>
            {EXTENSION_NAME}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item onClick={openLanguage} sx={{ bgcolor: '#BFA1FF26', borderRadius: '10px', cursor: 'pointer', p: '5px', width: 'fit-content' }}>
          <Typography color='#AA83DC' fontFamily='Inter' fontSize='13px' fontWeight={500}>
            {'EN'}
          </Typography>
          <ArrowDown2 color='#AA83DC80' size='15' variant='Bold' />
        </Grid>
      </Container>
      <SelectLanguage
        openMenu={popup === WelcomeHeaderPopups.LANGUAGE}
        setPopup={setPopup}
      />
      <PrivacyPolicy
        openMenu={popup === WelcomeHeaderPopups.PRIVACY}
        setPopup={setPopup}
      />
    </>
  );
}

export default WelcomeHeader;
