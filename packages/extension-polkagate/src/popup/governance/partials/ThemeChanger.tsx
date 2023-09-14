// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { DarkModeOutlined as DarkModeOutlinedIcon, LightModeOutlined as LightModeOutlinedIcon } from '@mui/icons-material';
import { Grid, keyframes, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { ColorContext } from '../../../components';

function ThemeChanger(): React.ReactElement {
  const theme = useTheme();
  const colorMode = useContext(ColorContext);

  const moonSlide = {
    come: keyframes`
    from{
      transform: translateY(-50px);
    }
    to{
      transform: translateY(7px);
    }`,
    go: keyframes`
    from{
      transform: translateY(7px);
    }
    to{
      transform: translateY(-50px);
    }`
  };

  const sunSlide = {
    come: keyframes`
    from{
      transform: translateY(50px);
    }
    to{
      transform: translateY(7px);
    }`,
    go: keyframes`
    from{
      transform: translateY(7px);
    }
    to{
      transform: translateY(50px);
    }`
  };

  const themeIconsStyle = {
    animationDuration: '250ms',
    animationFillMode: 'forwards',
    color: 'white',
    fontSize: '27px',
    left: '7px',
    m: 'auto',
    position: 'absolute',
    top: 0
  };

  const toggleTheme = useCallback(() => colorMode.toggleColorMode(), [colorMode]);

  return (
    <Grid container item onClick={toggleTheme} sx={{ border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', cursor: 'pointer', height: '42px', overflow: 'hidden', position: 'relative', width: '42px' }}>
      <LightModeOutlinedIcon sx={{ animationName: `${theme.palette.mode === 'dark' ? sunSlide.go : sunSlide.come}`, ...themeIconsStyle }} />
      <DarkModeOutlinedIcon sx={{ animationName: `${theme.palette.mode === 'dark' ? moonSlide.come : moonSlide.go}`, ...themeIconsStyle }} />
    </Grid>
  );
}

export default React.memo(ThemeChanger);
