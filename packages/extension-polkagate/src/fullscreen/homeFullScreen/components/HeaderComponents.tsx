// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React, { useCallback } from 'react';

import { setStorage } from '../../../components/Loading';
import HideBalance from '../../../components/SVG/HideBalance';
import { useIsHideNumbers } from '../../../hooks';
import Currency from '../partials/Currency';
import FavoriteChains from '../partials/FavoriteChains';

function HeaderComponents (): React.ReactElement {
  const isHideNumbers = useIsHideNumbers();

  const onHideClick = useCallback(() => {
    setStorage('hide_numbers', !isHideNumbers).catch(console.error);
  }, [isHideNumbers]);

  const spacings = '5px';

  return (
    <Grid columnGap={spacings} container item pl={spacings} width='fit-content'>
      <Currency />
      <HideBalance
        hide={isHideNumbers}
        noBorder={false}
        onClick={onHideClick}
        size={22}
      />
      <FavoriteChains />
    </Grid>
  );
}

export default React.memo(HeaderComponents);
