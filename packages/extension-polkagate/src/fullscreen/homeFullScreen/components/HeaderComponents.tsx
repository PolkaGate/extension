// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Badge, Grid } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { setStorage } from '../../../components/Loading';
import HideBalance from '../../../components/SVG/HideBalance';
import { useIsHideNumbers, useIsTestnetEnabled, useSelectedChains } from '../../../hooks';
import { TEST_NETS } from '../../../util/constants';
import Currency from '../partials/Currency';
import FavoriteChains from '../partials/FavoriteChains';

function HeaderComponents (): React.ReactElement {
  const selectedChains = useSelectedChains();
  const isTestNetEnabled = useIsTestnetEnabled();
  const isHideNumbers = useIsHideNumbers();

  const onHideClick = useCallback(() => {
    setStorage('hide_numbers', !isHideNumbers).catch(console.error);
  }, [isHideNumbers]);

  const badgeCount = useMemo(() => {
    if (!selectedChains?.length) {
      return 0;
    }

    let filteredList = selectedChains;

    if (!isTestNetEnabled) {
      filteredList = selectedChains.filter((item) => !TEST_NETS.includes(item));
    }

    return filteredList.length;
  }, [isTestNetEnabled, selectedChains]);

  return (
    <Grid columnGap='18px' container item pl='18px' width='fit-content'>
      <Currency />
      <Badge badgeContent={badgeCount} color='success'>
        <FavoriteChains />
      </Badge>
      <HideBalance
        hide={isHideNumbers}
        onClick={onHideClick}
        size={28}
      />
    </Grid>
  );
}

export default React.memo(HeaderComponents);
