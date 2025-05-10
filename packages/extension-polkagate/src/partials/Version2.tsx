// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import React, { type CSSProperties, useCallback, useRef, useState } from 'react';

import Sparkles from '../components/SVG/Sparkles';
import { useIsDark, useIsHovered, useManifest, useTranslation } from '../hooks';
import ChangeLog from '../popup/home/ChangeLog';
import { GradientBorder } from '../style';

interface Props {
  showLabel?: boolean;
  style?: CSSProperties;
}

export default function Version ({ showLabel = true, style = { columnGap: '5px', paddingBottom: '24px', paddingTop: '24px' } }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isDark = useIsDark();
  const version = useManifest()?.version;
  const containerRef = useRef(null);
  const hovered = useIsHovered(containerRef);

  const [openMenu, setOpenMenu] = useState<boolean>(false);

  const toggleOpenPopup = useCallback(() => setOpenMenu(true), []);

  const textColor = isDark ? '#BEAAD880' : '#8F97B8';
  const sparklesColor = isDark ? '#FF4FB9' : '#3988FF';

  return (
    <>
      <Grid alignItems='center' container item justifyContent='center' sx={{ ...style }}>
        {showLabel &&
          <Typography color={textColor} variant='B-1'>
            {t('Version')}
          </Typography>}
        <Typography color={textColor} variant='B-1'>
          {version}
        </Typography>
        <GradientBorder style={{ height: '1px', opacity: 0.5, position: 'static', rotate: '90deg', width: '14px', zIndex: 'auto' }} />
        <Sparkles color={hovered ? '#AA83DC' : sparklesColor} height={12} width={12} />
        <Typography color={hovered ? '#AA83DC' : '#BEAAD8'} onClick={toggleOpenPopup} ref={containerRef} sx={{ cursor: 'pointer', textDecoration: hovered ? 'underline' : 'none' }} variant='B-1'>
          {t('What’s new page')}
        </Typography>
      </Grid>
      {openMenu &&
        <ChangeLog
          openMenu={openMenu}
          setShowAlert={setOpenMenu}
        />}
    </>
  );
}
