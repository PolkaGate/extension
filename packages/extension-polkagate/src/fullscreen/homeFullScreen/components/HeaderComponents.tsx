// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React from 'react';

import HideBalance from '../../../components/SVG/HideBalance';
import { useIsHideNumbers } from '../../../hooks';
import Currency from '../partials/Currency';
import FavoriteChains from '../partials/FavoriteChains';

function HeaderComponents(): React.ReactElement {
  const { isHideNumbers, toggleHideNumbers } = useIsHideNumbers();

  const spacings = '5px';

  return (
    <Grid columnGap={spacings} container item pl={spacings} width='fit-content'>
      <HideBalance
        hide={isHideNumbers}
        noBorder={false}
        onClick={toggleHideNumbers}
        size={22}
      />
      <Currency />
      <FavoriteChains />
    </Grid>
  );
}

export default React.memo(HeaderComponents);
