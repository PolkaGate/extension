// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, Grid, Typography } from '@mui/material';
import { ArrowDown2, ShieldTick } from 'iconsax-react';
import React, { useCallback } from 'react';

import { logoTransparent } from '../assets/logos';
import { Popups } from '../popup/welcome';
import { EXTENSION_NAME } from '../util/constants';

interface Props {
  setPopup: React.Dispatch<React.SetStateAction<Popups>>
}

function WelcomeHeader ({ setPopup }: Props): React.ReactElement {
  const openLanguage = useCallback(() => {
    setPopup(Popups.LANGUAGE);
  }, [setPopup]);

  const openPrivacy = useCallback(() => {
    setPopup(Popups.PRIVACY);
  }, [setPopup]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', p: '5px 15px' }}>
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
  );
}

export default WelcomeHeader;
