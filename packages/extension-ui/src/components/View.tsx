// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import { CssBaseline, PaletteMode } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { createGlobalStyle } from 'styled-components';

import { ColorContext } from '../../../extension-polkagate/src/components';
import { darkTheme as dark } from '../../../extension-polkagate/src/themes/dark';
import { lightTheme as light } from '../../../extension-polkagate/src/themes/light';
import { chooseTheme, Main } from '.';

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

const BodyTheme = createGlobalStyle<ThemeProps>`
  body {
    background-color: ${({ theme }: ThemeProps): string => theme.primary};
  }

  html {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export default View;
