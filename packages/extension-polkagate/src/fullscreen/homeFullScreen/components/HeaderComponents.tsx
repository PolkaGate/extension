// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect } from 'react';

import { HideIcon, ShowIcon } from '../../../components';
import { useTranslation } from '../../../hooks';
import Currency from '../partials/Currency';
import FavoriteChains from '../partials/FavoriteChains';

interface Props {
  hideNumbers: boolean | undefined;
  setHideNumbers: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

export default function HeaderComponents ({ hideNumbers, setHideNumbers }: Props): React.ReactElement {
  const { t } = useTranslation();

  const onHideClick = useCallback(() => {
    setHideNumbers(!hideNumbers);
    window.localStorage.setItem('hide_numbers', hideNumbers ? 'false' : 'true');
  }, [hideNumbers, setHideNumbers]);

  useEffect(() => {
    const isHide = window.localStorage.getItem('hide_numbers');

    isHide === 'false' || isHide === null ? setHideNumbers(false) : setHideNumbers(true);
  }, [setHideNumbers]);

  const HideNumbers = () => (
    <Grid alignItems='center' container direction='column' item onClick={onHideClick} sx={{ border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', cursor: 'pointer', minWidth: '92px', p: '2px 6px', width: 'fit-content' }}>
      {hideNumbers
        ? <ShowIcon color='#fff' height={18} scale={1.2} width={40} />
        : <HideIcon color='#fff' height={18} scale={1.2} width={40} />
      }
      <Typography sx={{ color: '#fff', fontSize: '12px', fontWeight: 500, textWrap: 'nowrap' }}>
        {hideNumbers ? t('Show numbers') : t('Hide numbers')}
      </Typography>
    </Grid>
  );

  return (
    <Grid columnGap='18px' container item pl='18px' width='fit-content'>
      <Currency />
      <FavoriteChains />
      <HideNumbers />
    </Grid>
  );
}
