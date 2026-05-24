// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Typography, useTheme } from '@mui/material';
import React, { type CSSProperties, useCallback, useRef, useState } from 'react';

import Sparkles from '../components/SVG/Sparkles';
import { useIsDark, useIsExtensionPopup, useIsHovered, useTranslation } from '../hooks';
import ChangeLog from '../popup/home/ChangeLog';
import { Version } from '.';

interface Props {
  showLabel?: boolean;
  style?: CSSProperties;
}

function MyDivider(): React.ReactElement {
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();

  return (
    <Box
      sx={{
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(180deg, rgba(221, 227, 244, 0.1) 0%, rgba(221, 227, 244, 0.9) 50.06%, rgba(221, 227, 244, 0.1) 100%)'
          : 'linear-gradient(180deg, rgba(210, 185, 241, 0.07) 0%, rgba(210, 185, 241, 0.35) 50.06%, rgba(210, 185, 241, 0.07) 100%)',
        height: '14px',
        mx: isExtension ? '5px' : '15px',
        width: '1px'
      }}
    />
  );
}

function WhatsNew({ showLabel = true, style = { columnGap: '5px', paddingBottom: '24px', paddingTop: '24px' } }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = useIsDark();
  const containerRef = useRef(null);
  const hovered = useIsHovered(containerRef);

  const [openMenu, setOpenMenu] = useState<boolean>(false);

  const toggleOpenPopup = useCallback(() => setOpenMenu(true), []);

  const textColor = isDark ? '#BEAAD880' : '#8F97B8';
  const sparklesColor = isDark ? '#FF4FB9' : '#3988FF';
  const linkTextColor = isDark ? theme.palette.accent.text : theme.palette.accent.textStrong;
  const linkHoverColor = isDark ? theme.palette.accent.highlight : theme.palette.text.highlight;

  return (
    <>
      <Grid alignItems='center' container item justifyContent='center' sx={{ ...style }}>
        <Version
          shortLabel={false}
          showLabel={showLabel}
          style={{ padding: 0, width: 'fit-content' }}
          textColor={textColor}
          variant='B-1'
        />
        <MyDivider />
        <Sparkles color={hovered ? linkHoverColor : sparklesColor} height={12} width={12} />
        <Typography color={hovered ? linkHoverColor : linkTextColor} onClick={toggleOpenPopup} ref={containerRef} sx={{ cursor: 'pointer', textDecoration: hovered ? 'underline' : 'none' }} variant='B-1'>
          {t('What’s new page')}
        </Typography>
      </Grid>
      {openMenu &&
        <ChangeLog
          openMenu={openMenu}
          setShowAlert={setOpenMenu}
        />
      }
    </>
  );
}

export default React.memo(WhatsNew);
