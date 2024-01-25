// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import { useFullscreen } from '../../hooks';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import HeaderComponents from './components/HeaderComponents';

export default function HomePageFullScreen(): React.ReactElement {
  useFullscreen();
  const theme = useTheme();

  const [hideNumbers, setHideNumbers] = useState<boolean>();

  useEffect(() => {
    const isHide = window.localStorage.getItem('hide_numbers');

    isHide === 'false' || isHide === null ? setHideNumbers(false) : setHideNumbers(true);
  }, [setHideNumbers]);

  const indexBgColor = useMemo(() => theme.palette.mode === 'light' ? '#DFDFDF' : theme.palette.background.paper, [theme.palette]);

  return (
    <Grid bgcolor={indexBgColor} container item justifyContent='center'>
      <FullScreenHeader
        _otherComponents={
          <HeaderComponents
            hideNumbers={hideNumbers}
            setHideNumbers={setHideNumbers}
          />
        }
        noAccountDropDown
        noChainSwitch
      />
    </Grid>
  );
}
