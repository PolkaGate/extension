// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Grid, Popover, Typography, useTheme } from '@mui/material';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { HideIcon, ShowIcon } from '../../../components';
import { useTranslation } from '../../../hooks';
import Currency from '../partials/Currency';

interface Props {
  hideNumbers: boolean | undefined;
  setHideNumbers: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

export default function HeaderComponents({ hideNumbers, setHideNumbers }: Props): React.ReactElement {
  const { t } = useTranslation();

  const onHideClick = useCallback(() => {
    setHideNumbers(!hideNumbers);
    window.localStorage.setItem('hide_numbers', hideNumbers ? 'false' : 'true');
  }, [hideNumbers, setHideNumbers]);

  const HideNumbers = () => (
    <Grid alignItems='center' container direction='column' item onClick={onHideClick} sx={{ border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', cursor: 'pointer', p: '2px 6px', width: '92px' }}>
      {hideNumbers
        ? <ShowIcon color='#fff' height={18} scale={1.2} width={40} />
        : <HideIcon color='#fff' height={18} scale={1.2} width={40} />
      }
      <Typography sx={{ color: '#fff', fontSize: '12px', fontWeight: 500 }}>
        {hideNumbers ? t('Hide numbers') : t('Show numbers')}
      </Typography>
    </Grid>
  );

  return (
    <Grid columnGap='18px' container item pl='18px' width='fit-content'>
      <Currency />
      <HideNumbers />
    </Grid>
  );
}
