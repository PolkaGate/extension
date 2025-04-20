// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, type SxProps, type Theme, Typography } from '@mui/material';
import { ArrowDown2, ShieldTick } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';

import uiSetting from '@polkadot/ui-settings';

import { SettingsContext } from '../../components';
import CustomTooltip from '../../components/Tooltip';
import { useSelectedLanguage, useTranslation } from '../../hooks';
import PrivacyPolicy from '../../partials/PrivacyPolicy';
import SelectLanguage from '../../partials/SelectLanguage';
import { ExtensionPopups } from '../../util/constants';

function TopRightIcons (): React.ReactElement {
  const { t } = useTranslation();
  const privacyPolicyRef = useRef<HTMLDivElement>(null);

  const [popup, setPopup] = useState<ExtensionPopups>(ExtensionPopups.NONE);
  const [hovered, setHovered] = useState<ExtensionPopups>(ExtensionPopups.NONE);
  const languageTicker = useSelectedLanguage();

  const shieldHoveredStyle = {
    '&::after': {
      background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
      borderRadius: '10px',
      content: '""',
      inset: 0,
      opacity: hovered === ExtensionPopups.PRIVACY ? 1 : 0,
      position: 'absolute',
      transition: 'all 250ms ease-out'
    },
    background: '#BFA1FF26',
    borderRadius: '10px',
    inset: 0,
    position: 'absolute',
    transition: 'all 250ms ease-out'
  } as SxProps<Theme>;

  const openPopup = useCallback((popup: ExtensionPopups) => () => {
    setPopup(popup);
  }, [setPopup]);

  const onHoveredPopup = useCallback((popup?: ExtensionPopups) => () => {
    setHovered(popup ?? ExtensionPopups.NONE);
  }, [setHovered]);

  return (
    <Grid container sx={{ maxWidth: '30%', position: 'absolute', right: '0' }}>
      <Container disableGutters sx={{ alignItems: 'center', columnGap: '10px', display: 'flex', justifyContent: 'end', p: '5px 15px', zIndex: 1 }}>
        <Grid
          container
          item
          onClick={openPopup(ExtensionPopups.LANGUAGE)}
          onMouseEnter={onHoveredPopup(ExtensionPopups.LANGUAGE)}
          onMouseLeave={onHoveredPopup()}
          sx={{ alignItems: 'center', bgcolor: hovered === ExtensionPopups.LANGUAGE ? '#674394' : '#BFA1FF26', borderRadius: '10px', cursor: 'pointer', p: '5px', transition: 'all 250ms ease-out', width: 'fit-content' }}
        >
          <Typography color={hovered === ExtensionPopups.LANGUAGE ? '#EAEBF1' : '#AA83DC'} sx={{ textTransform: 'uppercase', transition: 'all 250ms ease-out' }} variant='B-1'>
            {languageTicker}
          </Typography>
          <ArrowDown2
            size='15'
            style={{ color: hovered === ExtensionPopups.LANGUAGE ? '#EAEBF1' : '#AA83DC80', transition: 'all 250ms ease-out' }}
            variant='Bold'
          />
        </Grid>
        <Grid
          container
          item
          onClick={openPopup(ExtensionPopups.PRIVACY)}
          onMouseEnter={onHoveredPopup(ExtensionPopups.PRIVACY)}
          onMouseLeave={onHoveredPopup()}
          ref={privacyPolicyRef}
          sx={{ alignItems: 'center', borderRadius: '10px', cursor: 'pointer', p: '3px', position: 'relative', width: 'fit-content' }}
        >
          <ShieldTick
            color={hovered === ExtensionPopups.PRIVACY ? '#EAEBF1' : '#82FFA5'}
            size='24'
            style={{ transition: 'all 250ms ease-out', zIndex: 10 }}
            variant={hovered === ExtensionPopups.PRIVACY ? 'Bold' : 'Bulk'}
          />
          <Grid sx={shieldHoveredStyle}></Grid>
        </Grid>
      </Container>
      <SelectLanguage
        openMenu={popup === ExtensionPopups.LANGUAGE}
        setPopup={setPopup}
      />
      <PrivacyPolicy
        openMenu={popup === ExtensionPopups.PRIVACY}
        setPopup={setPopup}
      />
      <CustomTooltip
        content={t('Privacy & Security')}
        placement='bottom'
        targetRef={privacyPolicyRef}
      />
    </Grid>
  );
}

export default TopRightIcons;
