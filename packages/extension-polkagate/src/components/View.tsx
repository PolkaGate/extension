// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CssBaseline, PaletteMode, Theme } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { createGlobalStyle } from 'styled-components';

import { darkTheme as dark } from '../themes/dark';
import { lightTheme as light } from '../themes/light';
import { chooseTheme, ColorContext, Main } from '.';

interface Props {
  children: React.ReactNode;
  className?: string;
}

function View({ children, className }: Props): React.ReactElement<Props> {
  const [mode, setMode] = React.useState<PaletteMode>(chooseTheme());

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        const toMode = mode === 'light' ? 'dark' : 'light';

        localStorage.setItem('theme', toMode);
        setMode(toMode);
      }
    }),
    [mode]
  );

  const theme = React.useMemo(
    () => createTheme(mode === 'light' ? light : dark),
    [mode]
  );

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

const BodyTheme = createGlobalStyle<Theme>`
  body {
    background-color: ${(props) => props.theme.palette.background.paper};
  }
  div#root{
   background-color: ${(props) => props.theme.palette.background.default};
  }
  html {
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export default View;
