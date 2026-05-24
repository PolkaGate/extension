// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PaletteMode, Theme } from '@mui/material';

import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { useEffect, useMemo, useState } from 'react';
import { createGlobalStyle } from 'styled-components';

import { darkTheme as dark } from '../themes/dark';
import { lightTheme as light } from '../themes/light';
import { STORAGE_KEY } from '../util/constants';
import { getAndWatchStorage, setStorage } from '../util/storage';
import { chooseTheme, ColorContext, Main } from '.';

interface Props {
  children: React.ReactNode;
}

function View({ children }: Props): React.ReactElement<Props> {
  const [mode, setMode] = useState<PaletteMode>(chooseTheme());

  const persistMode = (nextMode: PaletteMode) => {
    localStorage.setItem(STORAGE_KEY.THEME, nextMode);
    setStorage(STORAGE_KEY.THEME, nextMode).catch(console.error);
    setMode(nextMode);
  };

  useEffect(() => {
    const updateMode = (nextMode: PaletteMode | undefined) => {
      if (nextMode !== 'dark' && nextMode !== 'light') {
        return;
      }

      localStorage.setItem(STORAGE_KEY.THEME, nextMode);
      setMode(nextMode);
    };

    const unsubscribe = getAndWatchStorage<PaletteMode>(
      STORAGE_KEY.THEME,
      updateMode,
      false,
      chooseTheme()
    );

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY.THEME && (event.newValue === 'dark' || event.newValue === 'light')) {
        setMode(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      persistMode(mode === 'light' ? 'dark' : 'light');
    },
    setColorMode: (nextMode: PaletteMode) => {
      persistMode(nextMode);
    }
  }), [mode]);

  const theme = useMemo(() => {
    const base = mode === 'light' ? light : dark;

    return createTheme({
      ...base,
      components: base.components
    });
  }, [mode]);

  return (
    <ColorContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <BodyTheme theme={theme} />
        <Main>
          {children}
        </Main>
      </ThemeProvider>
    </ColorContext.Provider>
  );
}

const BodyTheme = createGlobalStyle<{ theme: Theme }>`
  body {
    background-color: ${(props) => props.theme.palette.background.paper};
    position: relative;
    cursor: default;
  }

  div#root{
    background-color: ${(props) => props.theme.palette.background.default};
  }

  /* Hide all scrollbars completely - no space consumption */
  * {
    /* Firefox - completely hide scrollbars */
    scrollbar-width: none;
    -ms-overflow-style: none; /* IE and Edge */
    
    /* Webkit - completely hide scrollbars */
    &::-webkit-scrollbar {
      display: none;
      width: 0 !important;
      height: 0 !important;
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      display: none;
    }
    
    &::-webkit-scrollbar-track {
      display: none;
    }
  }

  /* Custom overlay scrollbar that appears only when needed */
  .scrollbar-overlay {
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 8px;
      height: 100%;
      background: ${(props) => props.theme.palette.label.primary};
      border-radius: 4px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      z-index: 1000;
      transform: translateY(0%);
    }
    
    &.scrolling::after,
    &:hover::after {
      opacity: 0.6;
    }
  }

  /* Alternative: Use margin compensation technique */
  .no-scrollbar-space {
    /* Make container wider to hide scrollbar outside viewport */
    padding-right: 17px; /* Standard scrollbar width on Windows */
    margin-right: -17px;
    
    /* For horizontal scrollbars */
    &.horizontal {
      padding-bottom: 17px;
      margin-bottom: -17px;
    }
  }

  /* Auto-hide scrollbars script injection */
  @keyframes fadeOut {
    to { opacity: 0; }
  }
`;

export default View;
