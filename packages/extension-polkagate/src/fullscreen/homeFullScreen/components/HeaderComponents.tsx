// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Badge, Grid } from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';

import HideBalance from '../../../components/SVG/HideBalance';
import { useIsTestnetEnabled, useSelectedChains } from '../../../hooks';
import { TEST_NETS } from '../../../util/constants';
import Currency from '../partials/Currency';
import FavoriteChains from '../partials/FavoriteChains';

interface Props {
  hideNumbers: boolean | undefined;
  setHideNumbers: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

function HeaderComponents ({ hideNumbers, setHideNumbers }: Props): React.ReactElement {
  const selectedChains = useSelectedChains();
  const isTestNetEnabled = useIsTestnetEnabled();

  const onHideClick = useCallback(() => {
    setHideNumbers(!hideNumbers);
    window.localStorage.setItem('hide_numbers', hideNumbers ? 'false' : 'true');
  }, [hideNumbers, setHideNumbers]);

  useEffect(() => {
    const isHide = window.localStorage.getItem('hide_numbers');

    isHide === 'false' || isHide === null ? setHideNumbers(false) : setHideNumbers(true);
  }, [setHideNumbers]);

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
    <Grid columnGap='18px' container item pl='5px' width='fit-content'>
      <Currency />
      <Badge badgeContent={badgeCount} color='success'>
        <FavoriteChains />
      </Badge>
      <HideBalance
        hide={hideNumbers}
        onClick={onHideClick}
        size={28}
      />
    </Grid>
  );
}

export default React.memo(HeaderComponents);
