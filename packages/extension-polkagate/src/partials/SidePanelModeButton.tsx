// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, useTheme } from '@mui/material';
import { SidebarRight } from 'iconsax-react';
import React, { useCallback, useMemo, useRef } from 'react';

import { MyTooltip } from '../components';
import { useIsBlueish, useIsDark, useIsHovered, useIsSidePanel, useTranslation } from '../hooks';

interface ChromeWithSidePanel {
  sidePanel?: {
    open?: (options: { windowId: number }) => Promise<void>;
  };
  windows?: {
    WINDOW_ID_CURRENT: number;
  };
}

const getChrome = () => (globalThis as typeof globalThis & { chrome?: ChromeWithSidePanel }).chrome;

function SidePanelModeButton() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = useIsDark();
  const buttonContainer = useRef(null);
  const hovered = useIsHovered(buttonContainer);
  const isBlueish = useIsBlueish();
  const canOpenSidePanel = useMemo(() => Boolean(getChrome()?.sidePanel?.open), []);
  const isSidePanel = useIsSidePanel();

  const onClick = useCallback(() => {
    const chromeApi = getChrome();

    if (!chromeApi?.sidePanel?.open || !chromeApi.windows) {
      return;
    }

    chromeApi.sidePanel
      .open({ windowId: chromeApi.windows.WINDOW_ID_CURRENT })
      .then(() => window.close())
      .catch(console.error);
  }, []);

  if (!canOpenSidePanel || isSidePanel) {
    return null;
  }

  const gradientBackgroundStyle = {
    '&::after': {
      background: theme.palette.gradient.brand,
      borderRadius: '10px',
      content: '""',
      inset: 0,
      opacity: hovered ? 1 : 0,
      position: 'absolute',
      transition: 'all 250ms ease-out',
      zIndex: 1
    },
    background: isDark ? '#BFA1FF26' : '#FFFFFF',
    border: !isDark ? '1px solid #E1E5F3' : 'none',
    borderRadius: '10px',
    height: '30px',
    inset: 0,
    position: 'absolute',
    transition: 'all 250ms ease-out',
    width: '30px'
  };

  return (
    <MyTooltip
      content={t('Open side panel')}
    >
      <Box
        onClick={onClick}
        ref={buttonContainer}
        sx={{
          alignItems: 'center',
          cursor: 'pointer',
          display: 'flex',
          height: '30px',
          justifyContent: 'center',
          position: 'relative',
          width: '30px'
        }}
      >
        <SidebarRight color={hovered ? '#EAEBF1' : isBlueish ? theme.palette.text.highlight : isDark ? '#AA83DC' : '#291443'} size={18} style={{ zIndex: 5 }} variant='TwoTone' />
        <Grid sx={gradientBackgroundStyle} />
      </Box>
    </MyTooltip>
  );
}

export default SidePanelModeButton;
