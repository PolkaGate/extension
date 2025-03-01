// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { DarkModeOutlined as DarkModeOutlinedIcon, LightModeOutlined as LightModeOutlinedIcon } from '@mui/icons-material';
import { Grid, keyframes, useTheme } from '@mui/material';
import React, { useCallback, useContext, useMemo } from 'react';

import { ColorContext } from '../../../components';
import { HEADER_COMPONENT_STYLE } from '../FullScreenHeader';

interface Props {
  color?: string;
  left?: string;
  noBorder?: boolean
}

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

function ThemeChanger({ color, left = '7px', noBorder }: Props): React.ReactElement {
  const theme = useTheme();
  const colorMode = useContext(ColorContext);

  const _color = useMemo(() => color || (theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.secondary), [theme, color]);

  const themeIconsStyle = {
    animationDuration: '250ms',
    animationFillMode: 'forwards',
    color: _color,
    fontSize: '27px',
    left,
    m: 'auto',
    position: 'absolute',
    top: '0px'
  };

  const toggleTheme = useCallback(() => colorMode.toggleColorMode(), [colorMode]);

  return (
    <Grid alignItems='center' container item justifyContent='center' onClick={toggleTheme} sx={{ ...HEADER_COMPONENT_STYLE, border: noBorder ? 0 : HEADER_COMPONENT_STYLE?.border }}>
      <LightModeOutlinedIcon sx={{ animationName: `${theme.palette.mode === 'dark' ? sunSlide.go : sunSlide.come}`, ...themeIconsStyle }} />
      <DarkModeOutlinedIcon sx={{ animationName: `${theme.palette.mode === 'dark' ? moonSlide.come : moonSlide.go}`, ...themeIconsStyle }} />
    </Grid>
  );
}

export default React.memo(ThemeChanger);
