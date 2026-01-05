// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowDown2, ShieldTick } from 'iconsax-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { logoTransparent } from '../assets/logos';
import CustomTooltip from '../components/Tooltip';
import { useSelectedLanguage, useTranslation } from '../hooks';
import { EXTENSION_NAME, ExtensionPopups } from '../util/constants';
import { useExtensionPopups } from '../util/handleExtensionPopup';
import PrivacyPolicy from './PrivacyPolicy';
import SelectLanguage from './SelectLanguage';

function WelcomeHeader({ isBlueish }: { isBlueish: boolean }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const privacyPolicyRef = useRef<HTMLDivElement>(null);
  const languageTicker = useSelectedLanguage();
  const { extensionPopup, extensionPopupCloser, extensionPopupOpener } = useExtensionPopups();

  const [hovered, setHovered] = useState<ExtensionPopups>(ExtensionPopups.NONE);

  const shieldHoveredStyle = useMemo(() => ({
    '&::after': {
      background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
      borderRadius: '10px',
      content: '""',
      inset: 0,
      opacity: hovered === ExtensionPopups.PRIVACY ? 1 : 0,
      position: 'absolute',
      transition: 'all 250ms ease-out'
    },
    background: isBlueish ? '#809ACB26' : '#BFA1FF26',
    borderRadius: '10px',
    inset: 0,
    position: 'absolute',
    transition: 'all 250ms ease-out'
  } as SxProps<Theme>), [hovered, isBlueish]);

  const onHoveredPopup = useCallback((popup?: ExtensionPopups) => () => {
    setHovered(popup ?? ExtensionPopups.NONE);
  }, [setHovered]);

  return (
    <>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', p: '5px 15px', position: 'relative', zIndex: 2 }}>
        <Grid
          container
          item
          onClick={extensionPopupOpener(ExtensionPopups.PRIVACY)}
          onMouseEnter={onHoveredPopup(ExtensionPopups.PRIVACY)}
          onMouseLeave={onHoveredPopup()}
          ref={privacyPolicyRef}
          sx={{ alignItems: 'center', borderRadius: '10px', cursor: 'pointer', p: '3px', position: 'relative', width: 'fit-content' }}
        >
          <ShieldTick
            color={hovered === ExtensionPopups.PRIVACY ? '#EAEBF1' : isBlueish ? theme.palette.text.highlight : '#AA83DC'}
            size='24'
            style={{ transition: 'all 250ms ease-out', zIndex: 10 }}
            variant={hovered === ExtensionPopups.PRIVACY ? 'Bold' : 'Bulk'}
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
          onClick={extensionPopupOpener(ExtensionPopups.LANGUAGE)}
          onMouseEnter={onHoveredPopup(ExtensionPopups.LANGUAGE)}
          onMouseLeave={onHoveredPopup()}
          sx={{ alignItems: 'center', bgcolor: hovered === ExtensionPopups.LANGUAGE ? '#674394' : isBlueish ? '#809ACB26' : '#BFA1FF26', borderRadius: '10px', cursor: 'pointer', p: '5px', transition: 'all 250ms ease-out', width: 'fit-content' }}
        >
          <Typography color={hovered === ExtensionPopups.LANGUAGE ? '#EAEBF1' : isBlueish ? 'text.highlight' : '#AA83DC'} sx={{ textTransform: 'uppercase', transition: 'all 250ms ease-out' }} variant='B-1'>
            {languageTicker}
          </Typography>
          <ArrowDown2
            size='15'
            style={{ color: hovered === ExtensionPopups.LANGUAGE ? '#EAEBF1' : isBlueish ? '#809ACB80' : '#AA83DC80', transition: 'all 250ms ease-out' }}
            variant='Bold'
          />
        </Grid>
      </Container>
      <SelectLanguage
        onClose={extensionPopupCloser}
        openMenu={extensionPopup === ExtensionPopups.LANGUAGE}
      />
      <PrivacyPolicy
        onClose={extensionPopupCloser}
        openMenu={extensionPopup === ExtensionPopups.PRIVACY}
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
