// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PaletteMode, Theme } from '@mui/material';

import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { useEffect, useMemo, useState } from 'react';
import { createGlobalStyle } from 'styled-components';

import { darkTheme as dark } from '../themes/dark';
import { lightTheme as light } from '../themes/light';
import { chooseTheme, ColorContext, Main } from '.';

interface Props {
  children: React.ReactNode;
}

function View({ children }: Props): React.ReactElement<Props> {
  const [mode, setMode] = useState<PaletteMode>(chooseTheme());

  useEffect(() => {
    // Handler for storage events
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'theme') {
        // Type assertion since we know theme can only be 'light' or 'dark'
        setMode(event.newValue as PaletteMode);
      }
    };

    // Add event listener
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      const toMode = mode === 'light' ? 'dark' : 'light';

      localStorage.setItem('theme', toMode);
      setMode(toMode);
    }
  }), [mode]);

  const theme = useMemo(() => createTheme(mode === 'light' ? light : dark), [mode]);

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
