// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
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
  className?: string;
}

function View({ children, className }: Props): React.ReactElement<Props> {
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
        <Main className={className}>
          {children}
        </Main>
      </ThemeProvider>
    </ColorContext.Provider>
  );
}

const BodyTheme = createGlobalStyle<{ theme: Theme }>`
  body {
    background-color: ${(props) => props.theme.palette.background.paper};
  }
  div#root{
   background-color: ${(props) => props.theme.palette.background.default};
  }
  * {
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export default View;
