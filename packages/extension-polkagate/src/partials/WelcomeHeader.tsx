// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, Grid, type SxProps, type Theme, Typography } from '@mui/material';
import { ArrowDown2, ShieldTick } from 'iconsax-react';
import React, { useCallback, useRef, useState } from 'react';

import { logoTransparent } from '../assets/logos';
import CustomTooltip from '../components/Tooltip';
import { useTranslation } from '../hooks';
import { EXTENSION_NAME } from '../util/constants';
import PrivacyPolicy from './PrivacyPolicy';
import SelectLanguage from './SelectLanguage';

export enum WelcomeHeaderPopups {
  NONE,
  LANGUAGE,
  PRIVACY,
  WARNING
}

function WelcomeHeader (): React.ReactElement {
  const { t } = useTranslation();
  const privacyPolicyRef = useRef<HTMLDivElement>(null);

  const [popup, setPopup] = useState<WelcomeHeaderPopups>(WelcomeHeaderPopups.NONE);
  const [hovered, setHovered] = useState<WelcomeHeaderPopups>(WelcomeHeaderPopups.NONE);

  const shieldHoveredStyle = {
    '&::after': {
      background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
      borderRadius: '10px',
      content: '""',
      inset: 0,
      opacity: hovered === WelcomeHeaderPopups.PRIVACY ? 1 : 0,
      position: 'absolute',
      transition: 'all 250ms ease-out'
    },
    background: '#BFA1FF26',
    borderRadius: '10px',
    inset: 0,
    position: 'absolute',
    transition: 'all 250ms ease-out'
  } as SxProps<Theme>;

  const openPopup = useCallback((popup: WelcomeHeaderPopups) => () => {
    setPopup(popup);
  }, [setPopup]);

  const onHoveredPopup = useCallback((popup?: WelcomeHeaderPopups) => () => {
    setHovered(popup ?? WelcomeHeaderPopups.NONE);
  }, [setHovered]);

  return (
    <>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', p: '5px 15px', position: 'relative', zIndex: 1 }}>
        <Grid
          container
          item
          onClick={openPopup(WelcomeHeaderPopups.PRIVACY)}
          onMouseEnter={onHoveredPopup(WelcomeHeaderPopups.PRIVACY)}
          onMouseLeave={onHoveredPopup()}
          ref={privacyPolicyRef}
          sx={{ alignItems: 'center', borderRadius: '10px', cursor: 'pointer', p: '3px', position: 'relative', width: 'fit-content' }}
        >
          <ShieldTick
            color={hovered === WelcomeHeaderPopups.PRIVACY ? '#EAEBF1' : '#AA83DC'}
            size='24'
            style={{ transition: 'all 250ms ease-out', zIndex: 10 }}
            variant={hovered === WelcomeHeaderPopups.PRIVACY ? 'Bold' : 'Bulk'}
          />
          <Grid sx={shieldHoveredStyle}></Grid>
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
        <Grid
          container
          item
          onClick={openPopup(WelcomeHeaderPopups.LANGUAGE)}
          onMouseEnter={onHoveredPopup(WelcomeHeaderPopups.LANGUAGE)}
          onMouseLeave={onHoveredPopup()}
          sx={{ alignItems: 'center', bgcolor: hovered === WelcomeHeaderPopups.LANGUAGE ? '#674394' : '#BFA1FF26', borderRadius: '10px', cursor: 'pointer', p: '5px', transition: 'all 250ms ease-out', width: 'fit-content' }}
        >
          <Typography color={hovered === WelcomeHeaderPopups.LANGUAGE ? '#EAEBF1' : '#AA83DC'} sx={{ transition: 'all 250ms ease-out' }} variant='B-1'>
            {'EN'}
          </Typography>
          <ArrowDown2
            size='15'
            style={{ color: hovered === WelcomeHeaderPopups.LANGUAGE ? '#EAEBF1' : '#AA83DC80', transition: 'all 250ms ease-out' }}
            variant='Bold'
          />
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
      <CustomTooltip
        content={t('Privacy & Security')}
        placement='bottom'
        targetRef={privacyPolicyRef}
      />
    </>
  );
}

export default WelcomeHeader;
