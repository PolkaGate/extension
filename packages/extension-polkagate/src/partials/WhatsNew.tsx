// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Typography } from '@mui/material';
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
  const isExtension = useIsExtensionPopup();

  return (
    <Box
      sx={{
        background: 'linear-gradient(180deg, rgba(210, 185, 241, 0.07) 0%, rgba(210, 185, 241, 0.35) 50.06%, rgba(210, 185, 241, 0.07) 100%)',
        height: '14px',
        mx: isExtension ? '5px' : '15px',
        width: '1px'
      }}
    />
  );
}

function WhatsNew({ showLabel = true, style = { columnGap: '5px', paddingBottom: '24px', paddingTop: '24px' } }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isDark = useIsDark();
  const containerRef = useRef(null);
  const hovered = useIsHovered(containerRef);

  const [openMenu, setOpenMenu] = useState<boolean>(false);

  const toggleOpenPopup = useCallback(() => setOpenMenu(true), []);

  const textColor = isDark ? '#BEAAD880' : '#8F97B8';
  const sparklesColor = isDark ? '#FF4FB9' : '#3988FF';

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
        <Sparkles color={hovered ? '#AA83DC' : sparklesColor} height={12} width={12} />
        <Typography color={hovered ? '#AA83DC' : '#BEAAD8'} onClick={toggleOpenPopup} ref={containerRef} sx={{ cursor: 'pointer', textDecoration: hovered ? 'underline' : 'none' }} variant='B-1'>
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
